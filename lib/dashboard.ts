import { api } from "@/lib/api";
import type { ApiResource } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

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
