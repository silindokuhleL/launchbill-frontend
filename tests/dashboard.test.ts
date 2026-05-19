import { describe, expect, it } from "vitest";
import {
  dashboardHealthLabel,
  formatDashboardMoney,
  paymentHealthSeries,
  subscriptionStatusSeries,
} from "@/lib/dashboard";
import type { DashboardSummary } from "@/types/dashboard";

const summary: DashboardSummary = {
  account: {
    id: 1,
    name: "Acme LaunchBill Demo",
    billing_email: "billing@example.test",
  },
  revenue: {
    currency: "ZAR",
    total_revenue_cents: 49800,
    total_revenue: "498.00",
    pending_revenue_cents: 79900,
    pending_revenue: "799.00",
    failed_revenue_cents: 9900,
    failed_revenue: "99.00",
    outstanding_invoice_cents: 89800,
    outstanding_invoice: "898.00",
    active_mrr_cents: 49800,
    active_mrr: "498.00",
  },
  customers: {
    total: 3,
    active: 2,
    inactive: 1,
  },
  plans: {
    total: 3,
    active: 3,
    archived: 0,
  },
  subscriptions: {
    total: 3,
    active: 1,
    trialing: 1,
    paused: 1,
    past_due: 0,
    canceled: 0,
  },
  invoices: {
    total: 3,
    paid: 1,
    open: 1,
    overdue: 1,
    draft: 0,
    void: 0,
  },
  payments: {
    total: 3,
    succeeded: 1,
    pending: 1,
    failed: 1,
    refunded: 0,
  },
};

describe("dashboard helpers", () => {
  it("formats dashboard money", () => {
    expect(
      formatDashboardMoney({
        currency: "ZAR",
        amount: "498.00",
      }),
    ).toBe("ZAR 498.00");
  });

  it("labels dashboard health by billing priority", () => {
    expect(dashboardHealthLabel(summary)).toBe("Needs billing follow-up");
    expect(
      dashboardHealthLabel({
        ...summary,
        invoices: { ...summary.invoices, overdue: 0 },
        payments: { ...summary.payments, failed: 0 },
      }),
    ).toBe("Waiting on customer payments");
    expect(
      dashboardHealthLabel({
        ...summary,
        invoices: { ...summary.invoices, open: 0, overdue: 0 },
        payments: { ...summary.payments, failed: 0, pending: 0 },
      }),
    ).toBe("Billing is healthy");
  });

  it("maps dashboard summary into chart series", () => {
    expect(subscriptionStatusSeries(summary)).toEqual([
      expect.objectContaining({ label: "Active", value: 1 }),
      expect.objectContaining({ label: "Trialing", value: 1 }),
      expect.objectContaining({ label: "Paused", value: 1 }),
      expect.objectContaining({ label: "Past due", value: 0 }),
    ]);
    expect(paymentHealthSeries(summary)).toEqual([
      expect.objectContaining({ label: "Succeeded", value: 1 }),
      expect.objectContaining({ label: "Pending", value: 1 }),
      expect.objectContaining({ label: "Failed", value: 1 }),
      expect.objectContaining({ label: "Refunded", value: 0 }),
    ]);
  });
});
