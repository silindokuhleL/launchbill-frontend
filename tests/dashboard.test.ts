import { describe, expect, it } from "vitest";
import {
  dashboardHealthLabel,
  formatDashboardDate,
  formatDashboardMoney,
  paymentHealthSeries,
  recentInvoicesForDashboard,
  subscriptionStatusSeries,
} from "@/lib/dashboard";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";

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

const invoice: Invoice = {
  id: 1,
  account_id: 1,
  customer_id: 1,
  subscription_id: 1,
  provider_invoice_id: "demo_inv_001",
  number: "INV-2026-0001",
  amount_due_cents: 49800,
  amount_due: "498.00",
  amount_paid_cents: 49800,
  amount_paid: "498.00",
  currency: "ZAR",
  status: "paid",
  issued_at: "2026-05-10T10:00:00.000000Z",
  due_at: "2026-05-24T10:00:00.000000Z",
  paid_at: "2026-05-12T10:00:00.000000Z",
  voided_at: null,
  line_items: [],
  metadata: {},
  created_at: "2026-05-10T10:00:00.000000Z",
  updated_at: "2026-05-12T10:00:00.000000Z",
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

  it("sorts and limits recent invoices for the dashboard", () => {
    expect(
      recentInvoicesForDashboard(
        [
          { ...invoice, id: 1, number: "INV-2026-0001", issued_at: "2026-05-10T10:00:00.000000Z" },
          { ...invoice, id: 2, number: "INV-2026-0002", issued_at: "2026-05-18T10:00:00.000000Z" },
          { ...invoice, id: 3, number: "INV-2026-0003", issued_at: "2026-05-12T10:00:00.000000Z" },
        ],
        2,
      ).map((item) => item.number),
    ).toEqual(["INV-2026-0002", "INV-2026-0003"]);
  });

  it("formats dashboard dates", () => {
    expect(formatDashboardDate("2026-05-24T10:00:00.000000Z")).toContain("2026");
    expect(formatDashboardDate(null)).toBe("Not set");
  });
});
