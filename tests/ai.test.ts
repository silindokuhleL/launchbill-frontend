import { describe, expect, it } from "vitest";
import {
  billingSummaryToEditableText,
  generateBillingSummaryDraft,
} from "@/lib/ai";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";

const summary: DashboardSummary = {
  account: {
    billing_email: "billing@example.test",
    id: 1,
    name: "Acme LaunchBill Demo",
  },
  customers: {
    active: 2,
    inactive: 1,
    total: 3,
  },
  invoices: {
    draft: 0,
    open: 1,
    overdue: 1,
    paid: 1,
    total: 3,
    void: 0,
  },
  payments: {
    failed: 1,
    pending: 1,
    refunded: 0,
    succeeded: 1,
    total: 3,
  },
  plans: {
    active: 2,
    archived: 0,
    total: 2,
  },
  revenue: {
    active_mrr: "498.00",
    active_mrr_cents: 49800,
    currency: "ZAR",
    failed_revenue: "99.00",
    failed_revenue_cents: 9900,
    outstanding_invoice: "898.00",
    outstanding_invoice_cents: 89800,
    pending_revenue: "799.00",
    pending_revenue_cents: 79900,
    total_revenue: "498.00",
    total_revenue_cents: 49800,
  },
  subscriptions: {
    active: 1,
    canceled: 0,
    past_due: 0,
    paused: 1,
    total: 3,
    trialing: 1,
  },
};

const invoice: Invoice = {
  account_id: 1,
  amount_due: "99.00",
  amount_due_cents: 9900,
  amount_paid: "0.00",
  amount_paid_cents: 0,
  created_at: "2026-05-10T10:00:00.000000Z",
  currency: "ZAR",
  customer_id: 1,
  due_at: "2026-05-12T10:00:00.000000Z",
  id: 1,
  issued_at: "2026-05-10T10:00:00.000000Z",
  line_items: [],
  metadata: {},
  number: "INV-2026-0003",
  paid_at: null,
  provider_invoice_id: null,
  status: "overdue",
  subscription_id: 1,
  updated_at: "2026-05-10T10:00:00.000000Z",
  voided_at: null,
};

const payment: Payment = {
  account_id: 1,
  amount: "99.00",
  amount_cents: 9900,
  created_at: "2026-05-10T10:00:00.000000Z",
  currency: "ZAR",
  customer_id: 1,
  failed_at: "2026-05-12T10:00:00.000000Z",
  failure_reason: "Insufficient funds",
  id: 1,
  invoice_id: 1,
  metadata: {},
  paid_at: null,
  provider: "payfast",
  provider_payment_id: "pf_demo_failed",
  refunded_at: null,
  status: "failed",
  updated_at: "2026-05-12T10:00:00.000000Z",
};

describe("AI billing helpers", () => {
  it("generates a billing summary draft with next actions", () => {
    const draft = generateBillingSummaryDraft({
      invoices: [invoice, { ...invoice, id: 2, status: "open" }],
      payments: [payment],
      summary,
    });

    expect(draft.riskLevel).toBe("attention");
    expect(draft.title).toBe("Needs billing follow-up");
    expect(draft.narrative).toContain("Acme LaunchBill Demo");
    expect(draft.nextActions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("failed payment"),
        expect.stringContaining("overdue"),
      ]),
    );
  });

  it("formats the draft into editable text", () => {
    expect(
      billingSummaryToEditableText({
        narrative: "Revenue is stable.",
        nextActions: ["Review failed payments."],
        riskLevel: "watch",
        title: "Waiting on customer payments",
      }),
    ).toContain("Recommended next actions");
  });
});
