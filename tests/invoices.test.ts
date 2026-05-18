import { describe, expect, it } from "vitest";
import {
  formatInvoiceAmount,
  formatLineItemAmount,
  invoiceBalanceCents,
  invoiceStatusLabel,
} from "@/lib/invoices";
import type { Invoice } from "@/types/invoices";

const invoice: Invoice = {
  id: 1,
  account_id: 1,
  customer_id: 1,
  subscription_id: 1,
  provider_invoice_id: "demo_inv_northstar_001",
  number: "INV-2026-0001",
  amount_due_cents: 49800,
  amount_due: "498.00",
  amount_paid_cents: 24900,
  amount_paid: "249.00",
  currency: "ZAR",
  status: "open",
  issued_at: null,
  due_at: null,
  paid_at: null,
  voided_at: null,
  line_items: [
    {
      description: "Growth Billing x 2",
      quantity: 2,
      unit_price_cents: 24900,
      amount_cents: 49800,
    },
  ],
  metadata: {},
  created_at: null,
  updated_at: null,
};

describe("invoice helpers", () => {
  it("formats invoice and line item amounts", () => {
    expect(formatInvoiceAmount(invoice)).toBe("ZAR 498.00");
    expect(formatLineItemAmount(invoice.line_items[0])).toBe("ZAR 498.00");
  });

  it("formats invoice statuses", () => {
    expect(invoiceStatusLabel("overdue")).toBe("Overdue");
  });

  it("calculates invoice balances", () => {
    expect(invoiceBalanceCents(invoice)).toBe(24900);
    expect(
      invoiceBalanceCents({
        ...invoice,
        amount_paid_cents: 60000,
      }),
    ).toBe(0);
  });
});
