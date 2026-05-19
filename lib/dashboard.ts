import { api } from "@/lib/api";
import type { ApiResource } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

export type DashboardChartDatum = {
  color: string;
  label: string;
  value: number;
};

export async function getDashboardSummary() {
  const response = await api.get<ApiResource<DashboardSummary>>(
    "/dashboard/summary",
  );

  return response.data.data;
}

export function formatDashboardMoney(
  value: Pick<DashboardSummary["revenue"], "currency"> & {
    amount: string;
  },
) {
  return `${value.currency} ${value.amount}`;
}

export function dashboardHealthLabel(summary: DashboardSummary) {
  if (summary.invoices.overdue > 0 || summary.payments.failed > 0) {
    return "Needs billing follow-up";
  }

  if (summary.payments.pending > 0 || summary.invoices.open > 0) {
    return "Waiting on customer payments";
  }

  return "Billing is healthy";
}

export function subscriptionStatusSeries(
  summary: DashboardSummary,
): DashboardChartDatum[] {
  return [
    {
      color: "#0f6b3d",
      label: "Active",
      value: summary.subscriptions.active,
    },
    {
      color: "#27a96b",
      label: "Trialing",
      value: summary.subscriptions.trialing,
    },
    {
      color: "#a8792a",
      label: "Paused",
      value: summary.subscriptions.paused,
    },
    {
      color: "#b42318",
      label: "Past due",
      value: summary.subscriptions.past_due,
    },
  ];
}

export function paymentHealthSeries(summary: DashboardSummary): DashboardChartDatum[] {
  return [
    {
      color: "#0f6b3d",
      label: "Succeeded",
      value: summary.payments.succeeded,
    },
    {
      color: "#c47b13",
      label: "Pending",
      value: summary.payments.pending,
    },
    {
      color: "#b42318",
      label: "Failed",
      value: summary.payments.failed,
    },
    {
      color: "#667085",
      label: "Refunded",
      value: summary.payments.refunded,
    },
  ];
}
