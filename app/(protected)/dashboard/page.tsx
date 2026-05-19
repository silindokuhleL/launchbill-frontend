"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  Activity,
  Bot,
  CreditCard,
  FileText,
  Receipt,
  RefreshCcw,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import type { EChartsOption } from "echarts";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  dashboardHealthLabel,
  formatDashboardDate,
  formatDashboardMoney,
  getDashboardSummary,
  paymentHealthSeries,
  recentInvoicesForDashboard,
  subscriptionStatusSeries,
} from "@/lib/dashboard";
import {
  formatInvoiceAmount,
  invoiceBalanceCents,
  invoiceStatusLabel,
  listInvoices,
} from "@/lib/invoices";
import { useAuth } from "@/lib/auth-context";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice, InvoiceStatus } from "@/types/invoices";

const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-[#edf1f5] text-[#344054]",
  open: "bg-[#e6f5ff] text-[#075985]",
  overdue: "bg-[#fff4df] text-[#8a4a00]",
  paid: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  void: "bg-[#f4ebe8] text-[#8f2a1f]",
};

export default function DashboardPage() {
  const auth = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
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
  const canViewInvoices = Boolean(activeAccount?.permissions.includes("invoices.view"));

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

  const loadRecentInvoices = useCallback(async () => {
    if (!auth.activeAccountId || !canViewInvoices) {
      setRecentInvoices([]);
      setIsInvoicesLoading(false);
      return;
    }

    setIsInvoicesLoading(true);
    setInvoiceError(null);

    try {
      setRecentInvoices(recentInvoicesForDashboard(await listInvoices()));
    } catch (caughtError) {
      setInvoiceError(errorMessage(caughtError, "Could not load recent invoices."));
    } finally {
      setIsInvoicesLoading(false);
    }
  }, [auth.activeAccountId, canViewInvoices]);

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

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentInvoices() {
      if (!auth.activeAccountId || !canViewInvoices) {
        if (isMounted) {
          setRecentInvoices([]);
          setIsInvoicesLoading(false);
        }

        return;
      }

      try {
        const nextInvoices = recentInvoicesForDashboard(await listInvoices());

        if (isMounted) {
          setRecentInvoices(nextInvoices);
          setInvoiceError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setInvoiceError(errorMessage(caughtError, "Could not load recent invoices."));
        }
      } finally {
        if (isMounted) {
          setIsInvoicesLoading(false);
        }
      }
    }

    void fetchRecentInvoices();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canViewInvoices]);

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
  const subscriptionSeries = useMemo(
    () => (summary ? subscriptionStatusSeries(summary) : []),
    [summary],
  );
  const paymentSeries = useMemo(
    () => (summary ? paymentHealthSeries(summary) : []),
    [summary],
  );
  const subscriptionChartOption = useMemo(
    () => statusDonutOption(subscriptionSeries, "Subscriptions"),
    [subscriptionSeries],
  );
  const paymentChartOption = useMemo(
    () => paymentBarOption(paymentSeries),
    [paymentSeries],
  );

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
          <Button
            onClick={() => {
              void loadSummary();
              void loadRecentInvoices();
            }}
            variant="secondary"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Dashboard needs attention" message={error} tone="error" />
        ) : null}
        {invoiceError ? (
          <Alert title="Recent invoices need attention" message={invoiceError} tone="error" />
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

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <ChartPanel
                description="Subscription mix by lifecycle status."
                items={subscriptionSeries}
                title="Subscription status"
              >
                <DashboardChart
                  ariaLabel="Subscription status chart"
                  option={subscriptionChartOption}
                />
              </ChartPanel>
              <ChartPanel
                description="Provider payment outcomes from webhook records."
                items={paymentSeries}
                title="Payment health"
              >
                <DashboardChart
                  ariaLabel="Payment health chart"
                  option={paymentChartOption}
                />
              </ChartPanel>
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

          <RecentInvoicesPanel
            canViewInvoices={canViewInvoices}
            invoices={recentInvoices}
            isLoading={isInvoicesLoading}
          />
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

function RecentInvoicesPanel({
  canViewInvoices,
  invoices,
  isLoading,
}: {
  canViewInvoices: boolean;
  invoices: Invoice[];
  isLoading: boolean;
}) {
  return (
    <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Invoice follow-up
          </p>
          <h2 className="mt-2 text-xl font-bold text-[#102019]">Recent invoices</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Keep the newest billing documents visible without leaving the dashboard.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md bg-[#e5f4eb] px-3 py-2 text-sm font-bold text-[var(--brand-dark)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {invoices.length} shown
        </div>
      </div>

      {!canViewInvoices ? (
        <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4 text-sm font-semibold text-[var(--muted)]">
          Invoice visibility is controlled by the invoices.view permission.
        </div>
      ) : isLoading ? (
        <div className="mt-5 grid gap-3">
          {[0, 1, 2].map((item) => (
            <div
              className="h-20 animate-pulse rounded-md border border-[var(--border)] bg-[#e8f2ec]"
              key={item}
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4 text-sm font-semibold text-[var(--muted)]">
          No invoices have been issued for this account yet.
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-md border border-[#d8e7dd] md:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-[#f4fbf6] text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e7dd]">
                {invoices.map((invoice) => (
                  <InvoiceRow invoice={invoice} key={invoice.id} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {invoices.map((invoice) => (
              <InvoiceCard invoice={invoice} key={invoice.id} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const balance = invoiceBalanceCents(invoice);

  return (
    <tr className="bg-white align-top">
      <td className="break-words px-4 py-4 font-bold text-[#102019]">{invoice.number}</td>
      <td className="break-words px-4 py-4 font-semibold text-[#365548]">
        {invoice.customer?.name ?? `Customer #${invoice.customer_id}`}
      </td>
      <td className="px-4 py-4 font-semibold text-[#102019]">
        {formatInvoiceAmount(invoice)}
      </td>
      <td className="px-4 py-4 font-semibold text-[#102019]">
        ZAR {(balance / 100).toFixed(2)}
      </td>
      <td className="px-4 py-4 font-semibold text-[#365548]">
        {formatDashboardDate(invoice.due_at)}
      </td>
      <td className="px-4 py-4">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
    </tr>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const balance = invoiceBalanceCents(invoice);

  return (
    <article className="rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-base font-bold text-[#102019]">
              {invoice.number}
            </h3>
            <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
              {invoice.customer?.name ?? `Customer #${invoice.customer_id}`}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="grid gap-2 text-sm">
          <DashboardPill label="Amount" value={formatInvoiceAmount(invoice)} />
          <DashboardPill label="Balance" value={`ZAR ${(balance / 100).toFixed(2)}`} />
          <DashboardPill label="Due" value={formatDashboardDate(invoice.due_at)} />
        </div>
      </div>
    </article>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${invoiceStatusStyles[status]}`}
    >
      {invoiceStatusLabel(status)}
    </span>
  );
}

function ChartPanel({
  children,
  description,
  items,
  title,
}: {
  children: React.ReactNode;
  description: string;
  items: Array<{ color: string; label: string; value: number }>;
  title: string;
}) {
  return (
    <div className="rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-[#102019]">{title}</h3>
        <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-3 min-w-0">{children}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#365548]"
            key={item.label}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}: {item.value}
          </span>
        ))}
      </div>
    </div>
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

function statusDonutOption(
  items: Array<{ color: string; label: string; value: number }>,
  title: string,
): EChartsOption {
  return {
    color: items.map((item) => item.color),
    series: [
      {
        avoidLabelOverlap: true,
        data: items.map((item) => ({
          name: item.label,
          value: item.value,
        })),
        emphasis: {
          label: {
            fontSize: 18,
            fontWeight: 700,
            show: true,
          },
        },
        label: {
          color: "#365548",
          formatter: "{b}: {c}",
        },
        name: title,
        radius: ["48%", "72%"],
        type: "pie",
      },
    ],
    tooltip: {
      trigger: "item",
      valueFormatter: (value) => String(value),
    },
  };
}

function paymentBarOption(
  items: Array<{ color: string; label: string; value: number }>,
): EChartsOption {
  return {
    grid: {
      bottom: 24,
      containLabel: true,
      left: 12,
      right: 16,
      top: 24,
    },
    series: [
      {
        barMaxWidth: 42,
        data: items.map((item) => ({
          itemStyle: {
            color: item.color,
            borderRadius: [6, 6, 0, 0],
          },
          value: item.value,
        })),
        type: "bar",
      },
    ],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => String(value),
    },
    xAxis: {
      axisLabel: {
        color: "#587064",
        fontWeight: 700,
        interval: 0,
      },
      axisLine: {
        lineStyle: {
          color: "#d8e7dd",
        },
      },
      axisTick: {
        show: false,
      },
      data: items.map((item) => item.label),
      type: "category",
    },
    yAxis: {
      axisLabel: {
        color: "#587064",
      },
      splitLine: {
        lineStyle: {
          color: "#e8f2ec",
        },
      },
      type: "value",
    },
  };
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
