"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brush,
  ClipboardList,
  FileWarning,
  Gauge,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  adminAccessLevel,
  adminExceptionCount,
  adminReadinessItems,
  canAccessAdminPortal,
  type AdminReadinessStatus,
} from "@/lib/admin";
import { useAuth } from "@/lib/auth-context";
import { formatDashboardMoney, getDashboardSummary } from "@/lib/dashboard";
import { listInvoices } from "@/lib/invoices";
import { listPayments } from "@/lib/payments";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPanel } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";

type AdminPortalData = {
  invoices: Invoice[];
  payments: Payment[];
  summary: DashboardSummary;
};

const statusStyles: Record<AdminReadinessStatus, string> = {
  blocked: "bg-[#fff1f0] text-[#9b1c12]",
  ready: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  watch: "bg-[#fff4df] text-[#8a4a00]",
};

const quickActions = [
  {
    description: "Review tenant members and role assignment before inviting more users.",
    href: "/team",
    icon: Users,
    label: "Manage team access",
  },
  {
    description: "Check request, auth, tenant, billing, and AI audit history.",
    href: "/audit",
    icon: ClipboardList,
    label: "Open audit log",
  },
  {
    description: "Tune branding, notification, and integration settings.",
    href: "/settings",
    icon: Brush,
    label: "Update settings",
  },
  {
    description: "Generate admin notes and billing handoff summaries.",
    href: "/ai",
    icon: Bot,
    label: "Use AI assist",
  },
];

export function AdminPortalClient() {
  const auth = useAuth();
  const [portalData, setPortalData] = useState<AdminPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );

  const canAccess = canAccessAdminPortal({
    account: activeAccount,
    user: auth.user,
  });

  const accessLevel = adminAccessLevel({
    account: activeAccount,
    user: auth.user,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchPortalData() {
      if (!auth.activeAccountId || !canAccess) {
        if (isMounted) {
          setPortalData(null);
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);

      try {
        const [summary, invoices, payments] = await Promise.all([
          getDashboardSummary(),
          listInvoices(),
          listPayments(),
        ]);

        if (isMounted) {
          setPortalData({ invoices, payments, summary });
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load admin portal data."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchPortalData();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canAccess]);

  function refreshPortalData() {
    setPortalData(null);
    setIsLoading(true);

    void Promise.all([getDashboardSummary(), listInvoices(), listPayments()])
      .then(([summary, invoices, payments]) => {
        setPortalData({ invoices, payments, summary });
        setError(null);
      })
      .catch((caughtError) => {
        setError(errorMessage(caughtError, "Could not refresh admin portal data."));
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin control"
        title="Admin Portal"
        description="Review account access, billing readiness, AI workflows, and operational next steps from one control surface."
      />

      {!canAccess ? (
        <EmptyState
          description="Admin portal access is reserved for account owners, tenant admins, and platform admins."
          icon={ShieldCheck}
          title="Admin portal is restricted"
        />
      ) : null}

      {canAccess ? (
        <>
          <section className="mb-5 rounded-lg border border-[#b7d8c3] bg-[#f4fbf6] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--brand-dark)]">
                  {activeAccount?.name ?? "No account selected"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {accessLevel} access for {auth.user?.email ?? "current user"}.
                </p>
              </div>
              <Button
                disabled={isLoading || !portalData}
                isLoading={isLoading}
                onClick={refreshPortalData}
                variant="secondary"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </section>

          {error ? (
            <Alert title="Admin portal needs attention" message={error} tone="error" />
          ) : null}

          {isLoading ? (
            <SkeletonPanel />
          ) : portalData && activeAccount ? (
            <div className="grid gap-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetric
                  icon={ShieldCheck}
                  label="Access level"
                  value={accessLevel}
                />
                <AdminMetric
                  icon={Users}
                  label="Roles"
                  value={String(activeAccount.roles.length)}
                />
                <AdminMetric
                  icon={Gauge}
                  label="Permissions"
                  value={String(activeAccount.permissions.length)}
                />
                <AdminMetric
                  icon={FileWarning}
                  label="Billing exceptions"
                  value={String(adminExceptionCount(portalData.summary))}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                        Access overview
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-[#102019]">
                        Tenant administration scope
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#e5f4eb] px-3 py-1 text-xs font-bold text-[var(--brand-dark)]">
                      {activeAccount.status}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <AdminDetail label="Billing email" value={activeAccount.billing_email ?? "Not set"} />
                    <AdminDetail label="Owner account" value={activeAccount.is_owner ? "Yes" : "No"} />
                    <AdminDetail label="Theme color" value={activeAccount.theme.primary_color ?? "Not set"} />
                    <AdminDetail
                      label="Outstanding revenue"
                      value={formatDashboardMoney({
                        amount: portalData.summary.revenue.outstanding_invoice,
                        currency: portalData.summary.revenue.currency,
                      })}
                    />
                  </dl>

                  <div className="mt-5 grid gap-4">
                    <ChipGroup label="Roles" values={activeAccount.roles} />
                    <ChipGroup
                      label="Key permissions"
                      values={activeAccount.permissions.slice(0, 12)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                    Operational readiness
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[#102019]">
                    What needs admin attention
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {adminReadinessItems({
                      account: activeAccount,
                      aiWorkflowsComplete: 3,
                      summary: portalData.summary,
                    }).map((item) => (
                      <div
                        className="rounded-md border border-[var(--border)] bg-[#fbfefd] p-4"
                        key={item.label}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-[#102019]">{item.label}</p>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[item.status]}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                    Admin quick actions
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[#102019]">
                    Move to the next control page
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => (
                    <Link
                      className="group rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9ed4af] hover:shadow-md"
                      href={action.href}
                      key={action.href}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
                          <action.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <ArrowRight
                          className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="mt-4 font-bold text-[#102019]">{action.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function AdminMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      </div>
      <p className="mt-4 break-words text-2xl font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function AdminDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f5fbf7] p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#102019]">{value}</dd>
    </div>
  );
}

function ChipGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#102019]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((value) => (
            <span
              className="rounded-full border border-[#b7d8c3] bg-[#f4fbf6] px-3 py-1 text-xs font-semibold text-[var(--brand-dark)]"
              key={value}
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-sm text-[var(--muted)]">No values assigned.</span>
        )}
      </div>
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  return fallback;
}
