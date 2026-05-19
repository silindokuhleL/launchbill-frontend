"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  Activity,
  Bot,
  CreditCard,
  Receipt,
  RefreshCcw,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  dashboardHealthLabel,
  formatDashboardMoney,
  getDashboardSummary,
} from "@/lib/dashboard";
import { useAuth } from "@/lib/auth-context";
import type { DashboardSummary } from "@/types/dashboard";

export default function DashboardPage() {
  const auth = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const roles = activeAccount?.roles.length
    ? activeAccount.roles
    : (auth.user?.global_roles ?? []);
  const permissions = activeAccount?.permissions.length
    ? activeAccount.permissions
    : (auth.user?.global_permissions ?? []);
  const canViewDashboard = Boolean(
    activeAccount?.permissions.includes("dashboard.view"),
  );

  const loadSummary = useCallback(async () => {
    if (!auth.activeAccountId || !canViewDashboard) {
      setSummary(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setSummary(await getDashboardSummary());
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load dashboard metrics."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canViewDashboard]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      if (!auth.activeAccountId || !canViewDashboard) {
        if (isMounted) {
          setSummary(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const nextSummary = await getDashboardSummary();

        if (isMounted) {
          setSummary(nextSummary);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load dashboard metrics."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canViewDashboard]);

  const metricCards = summary
    ? [
        {
          label: "Revenue",
          value: formatDashboardMoney({
            currency: summary.revenue.currency,
            amount: summary.revenue.total_revenue,
          }),
          detail: "Succeeded payments",
          icon: TrendingUp,
        },
        {
          label: "Active MRR",
          value: formatDashboardMoney({
            currency: summary.revenue.currency,
            amount: summary.revenue.active_mrr,
          }),
          detail: "Active subscriptions",
          icon: WalletCards,
        },
        {
          label: "Customers",
          value: String(summary.customers.total),
          detail: `${summary.customers.active} active`,
          icon: Users,
        },
        {
          label: "Payments",
          value: String(summary.payments.total),
          detail: `${summary.payments.failed} failed`,
          icon: Receipt,
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Billing command center"
        title={`Welcome, ${auth.user?.name ?? "there"}`}
        description="Track real customer, subscription, invoice, and payment metrics from the Laravel API."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canViewDashboard ? (
          <Button onClick={loadSummary} variant="secondary">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Dashboard needs attention" message={error} tone="error" />
        ) : null}
      </div>

      {!canViewDashboard ? (
        <EmptyState
          description="This account role cannot view dashboard metrics. Dashboard visibility is controlled by the dashboard.view permission."
          icon={Activity}
          title="Dashboard access is restricted"
        />
      ) : isLoading ? (
        <DashboardSkeleton />
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => {
              const Icon = card.icon;

              return (
                <section
                  className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
                  key={card.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--muted)]">
                      {card.label}
                    </p>
                    <Icon
                      className="h-5 w-5 shrink-0 text-[var(--brand)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-4 break-words text-3xl font-bold text-[#102019]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                    {card.detail}
                  </p>
                </section>
              );
            })}
          </div>

          <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Billing health
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#102019]">
                  {dashboardHealthLabel(summary)}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Revenue counts only succeeded payments. Outstanding invoices and
                  failed payments stay visible so the next follow-up is obvious.
                </p>
              </div>
              <div className="grid min-w-0 gap-2 text-sm sm:grid-cols-3 lg:w-[420px]">
                <DashboardPill
                  label="Outstanding"
                  value={formatDashboardMoney({
                    currency: summary.revenue.currency,
                    amount: summary.revenue.outstanding_invoice,
                  })}
                />
                <DashboardPill label="Open invoices" value={summary.invoices.open} />
                <DashboardPill label="Overdue" value={summary.invoices.overdue} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <StatusPanel
                items={[
                  ["Active", summary.subscriptions.active],
                  ["Trialing", summary.subscriptions.trialing],
                  ["Paused", summary.subscriptions.paused],
                  ["Past due", summary.subscriptions.past_due],
                ]}
                title="Subscriptions"
              />
              <StatusPanel
                items={[
                  ["Paid", summary.invoices.paid],
                  ["Open", summary.invoices.open],
                  ["Overdue", summary.invoices.overdue],
                  ["Draft", summary.invoices.draft],
                ]}
                title="Invoices"
              />
              <StatusPanel
                items={[
                  ["Succeeded", summary.payments.succeeded],
                  ["Pending", summary.payments.pending],
                  ["Failed", summary.payments.failed],
                  ["Refunded", summary.payments.refunded],
                ]}
                title="Payments"
              />
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          description="Dashboard metrics will appear once the selected account has billing records."
          icon={CreditCard}
          title="No dashboard metrics yet"
        />
      )}

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Access preview
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#102019]">
              {activeAccount?.name ?? "Platform access"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This confirms the seeded users do not all have the same permissions.
            </p>
          </div>
          <div className="rounded-md bg-[#e5f4eb] px-4 py-3 text-sm font-bold text-[var(--brand-dark)]">
            {permissions.length} permissions
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="text-sm font-bold text-[#102019]">Roles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.length ? (
                roles.map((role) => (
                  <span
                    className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-3 py-1 text-sm font-semibold text-[var(--brand-dark)]"
                    key={role}
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">No role in this scope</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#102019]">Permissions</p>
            <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
              {permissions.map((permission) => (
                <span
                  className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-semibold text-[#365548]"
                  key={permission}
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <EmptyState
          description="The dashboard now reads real billing totals. Next we can connect charts, AI summaries, and operational follow-up workflows."
          icon={Bot}
          title="Ready for deeper insights"
        />
      </div>
    </>
  );
}

function DashboardPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function StatusPanel({
  items,
  title,
}: {
  items: Array<[string, number]>;
  title: string;
}) {
  return (
    <div className="rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4">
      <h3 className="text-sm font-bold text-[#102019]">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div className="flex items-center justify-between gap-3" key={label}>
            <span className="min-w-0 text-sm font-semibold text-[var(--muted)]">
              {label}
            </span>
            <span className="rounded-md bg-[#e5f4eb] px-2.5 py-1 text-sm font-bold text-[var(--brand-dark)]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          className="h-36 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
      <div className="h-80 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec] sm:col-span-2 xl:col-span-4" />
    </section>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
