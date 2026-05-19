"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  adminActivityInsightToEditableText,
  billingSummaryToEditableText,
  generateAdminActivityInsight,
  generateBillingSummaryDraft,
} from "@/lib/ai";
import { formatDashboardMoney, getDashboardSummary } from "@/lib/dashboard";
import { listInvoices } from "@/lib/invoices";
import { listPayments } from "@/lib/payments";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import type {
  AdminActivityInsight,
  BillingSummaryDraft,
  BillingRiskLevel,
} from "@/types/ai";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";

type BillingData = {
  invoices: Invoice[];
  payments: Payment[];
  summary: DashboardSummary;
};

const riskStyles: Record<BillingRiskLevel, string> = {
  attention: "bg-[#fff4df] text-[#8a4a00]",
  healthy: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  watch: "bg-[#e6f5ff] text-[#075985]",
};

export function BillingSummaryAssistant() {
  const auth = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [draft, setDraft] = useState<BillingSummaryDraft | null>(null);
  const [adminInsight, setAdminInsight] = useState<AdminActivityInsight | null>(null);
  const [editableSummary, setEditableSummary] = useState("");
  const [editableAdminInsight, setEditableAdminInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAdmin, setIsGeneratingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canUseBillingSummary = Boolean(
    activeAccount?.permissions.includes("ai.billing_summary"),
  );
  const canUseAdminInsight = Boolean(
    activeAccount?.permissions.includes("audit.view") ||
      activeAccount?.permissions.includes("roles.manage") ||
      auth.user?.global_roles.includes("super_admin"),
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchBillingData() {
      if (!auth.activeAccountId || !canUseBillingSummary) {
        if (isMounted) {
          setBillingData(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const [summary, invoices, payments] = await Promise.all([
          getDashboardSummary(),
          listInvoices(),
          listPayments(),
        ]);

        if (isMounted) {
          setBillingData({ invoices, payments, summary });
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load AI billing context."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchBillingData();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canUseBillingSummary]);

  async function handleGenerate() {
    if (!billingData) {
      setError("Billing context is not ready yet.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const nextDraft = generateBillingSummaryDraft(billingData);

      setDraft(nextDraft);
      setEditableSummary(billingSummaryToEditableText(nextDraft));
    } catch {
      setError("The billing summary assistant could not generate a draft.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateAdminInsight() {
    if (!billingData || !activeAccount || !auth.user) {
      setError("Admin activity context is not ready yet.");
      return;
    }

    setIsGeneratingAdmin(true);
    setError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const nextInsight = generateAdminActivityInsight({
        account: activeAccount,
        invoices: billingData.invoices,
        payments: billingData.payments,
        summary: billingData.summary,
        user: auth.user,
      });

      setAdminInsight(nextInsight);
      setEditableAdminInsight(adminActivityInsightToEditableText(nextInsight));
    } catch {
      setError("The admin activity assistant could not generate insight.");
    } finally {
      setIsGeneratingAdmin(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="AI-assisted billing"
        title="AI Assist"
        description="Generate editable billing summaries from tenant-safe dashboard, invoice, and payment data."
      />

      <div className="mb-5 rounded-lg border border-[#b7d8c3] bg-[#f4fbf6] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--brand-dark)]">
              {activeAccount?.name ?? "No account selected"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              AI output is a draft. You review and edit it before using it.
            </p>
          </div>
          {canUseBillingSummary ? (
            <Button
              disabled={!billingData}
              isLoading={isGenerating}
              onClick={handleGenerate}
            >
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Generate summary
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <Alert title="AI assist needs attention" message={error} tone="error" />
      ) : null}

      {!canUseBillingSummary ? (
        <div className="mt-5">
          <EmptyState
            description="Billing summaries are controlled by the ai.billing_summary permission."
            icon={Bot}
            title="AI billing summary is restricted"
          />
        </div>
      ) : isLoading ? (
        <BillingSummarySkeleton />
      ) : billingData ? (
        <div className="mt-5 grid gap-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AiMetric
              icon={CheckCircle2}
              label="Revenue"
              value={formatDashboardMoney({
                amount: billingData.summary.revenue.total_revenue,
                currency: billingData.summary.revenue.currency,
              })}
            />
            <AiMetric
              icon={RefreshCcw}
              label="Active MRR"
              value={formatDashboardMoney({
                amount: billingData.summary.revenue.active_mrr,
                currency: billingData.summary.revenue.currency,
              })}
            />
            <AiMetric
              icon={FileText}
              label="Open invoices"
              value={String(billingData.summary.invoices.open)}
            />
            <AiMetric
              icon={ClipboardList}
              label="Failed payments"
              value={String(billingData.summary.payments.failed)}
            />
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Billing summary assistant
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#102019]">
                  Editable AI draft
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Use this draft for internal billing reviews, customer follow-up
                  planning, or admin handoff notes.
                </p>
              </div>
              {draft ? (
                <span
                  className={`w-fit rounded-md px-3 py-2 text-sm font-bold ${riskStyles[draft.riskLevel]}`}
                >
                  {draft.riskLevel}
                </span>
              ) : null}
            </div>

            {draft ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                <label className="block">
                  <span className="text-sm font-bold text-[#102019]">
                    Review and edit output
                  </span>
                  <textarea
                    className="mt-2 min-h-72 w-full resize-y rounded-md border border-[var(--border)] bg-[#fbfdfc] p-4 text-sm leading-6 text-[#102019] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#b7d8c3]"
                    onChange={(event) => setEditableSummary(event.target.value)}
                    value={editableSummary}
                  />
                </label>
                <div className="rounded-md bg-[#f4fbf6] p-4">
                  <p className="text-sm font-bold text-[#102019]">Next actions</p>
                  <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted)]">
                    {draft.nextActions.map((action) => (
                      <li className="flex gap-2" key={action}>
                        <Sparkles
                          className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]"
                          aria-hidden="true"
                        />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid gap-2">
                    <AiLink href="/invoices" label="Review invoices" />
                    <AiLink href="/payments" label="Review payments" />
                    <AiLink href="/subscriptions" label="Review subscriptions" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-6 text-sm leading-6 text-[var(--muted)]">
                Click generate to create the first editable billing summary from
                current dashboard, invoice, and payment data.
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Admin activity insight
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#102019]">
                  Account and permission review
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Summarize tenant activity, visible roles, permissions, and admin
                  follow-up signals from returned account data.
                </p>
              </div>
              {adminInsight ? (
                <span
                  className={`w-fit rounded-md px-3 py-2 text-sm font-bold ${riskStyles[adminInsight.riskLevel]}`}
                >
                  {adminInsight.riskLevel}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-[#102019] md:grid-cols-3">
              <AdminMetric
                label="Roles"
                value={
                  activeAccount?.roles.length
                    ? activeAccount.roles.join(", ")
                    : auth.user?.global_roles.join(", ") || "No role assigned"
                }
              />
              <AdminMetric
                label="Permissions"
                value={String(
                  activeAccount?.permissions.length ||
                    auth.user?.global_permissions.length ||
                    0,
                )}
              />
              <AdminMetric label="Account status" value={activeAccount?.status ?? "Unknown"} />
            </div>

            {!canUseAdminInsight ? (
              <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4 text-sm font-semibold text-[var(--muted)]">
                Admin activity insights require audit or role-management access.
              </div>
            ) : (
              <>
                <div className="mt-5">
                  <Button
                    disabled={!billingData}
                    isLoading={isGeneratingAdmin}
                    onClick={handleGenerateAdminInsight}
                    variant="secondary"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Generate admin insight
                  </Button>
                </div>

                {adminInsight ? (
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                    <label className="block">
                      <span className="text-sm font-bold text-[#102019]">
                        Review and edit insight
                      </span>
                      <textarea
                        className="mt-2 min-h-72 w-full resize-y rounded-md border border-[var(--border)] bg-[#fbfdfc] p-4 text-sm leading-6 text-[#102019] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#b7d8c3]"
                        onChange={(event) => setEditableAdminInsight(event.target.value)}
                        value={editableAdminInsight}
                      />
                    </label>
                    <div className="rounded-md bg-[#f4fbf6] p-4">
                      <p className="text-sm font-bold text-[#102019]">Admin actions</p>
                      <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted)]">
                        {adminInsight.nextActions.map((action) => (
                          <li className="flex gap-2" key={action}>
                            <Sparkles
                              className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]"
                              aria-hidden="true"
                            />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 grid gap-2">
                        <AiLink href="/audit" label="Review audit" />
                        <AiLink href="/team" label="Review team" />
                        <AiLink href="/settings" label="Review settings" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-6 text-sm leading-6 text-[var(--muted)]">
                    Generate an admin insight when you need a quick release or
                    access-control review.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            description="Billing context is unavailable. Confirm the backend API is running and the account has seeded billing data."
            icon={Bot}
            title="No AI context available"
          />
        </div>
      )}
    </>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function AiLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-between gap-3 rounded-md border border-[#d8e7dd] bg-white px-3 py-2 text-sm font-bold text-[#102019] transition hover:bg-[#eef7f1]"
      href={href}
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
    </Link>
  );
}

function AiMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
        <Icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
      </div>
      <p className="mt-3 break-words text-2xl font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function BillingSummarySkeleton() {
  return (
    <div className="mt-5 grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
            key={item}
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]" />
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
