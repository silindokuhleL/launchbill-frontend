import { describe, expect, it } from "vitest";
import {
  formatPaymentAmount,
  paymentStatusLabel,
  paymentTimelineLabel,
} from "@/lib/payments";
import type { Payment } from "@/types/payments";

const payment: Payment = {
  id: 1,
  account_id: 1,
  invoice_id: 1,
  customer_id: 1,
  provider: "payfast",
  provider_payment_id: "pf_demo_northstar_001",
  amount_cents: 49800,
  amount: "498.00",
  currency: "ZAR",
  status: "succeeded",
  failure_reason: null,
  paid_at: "2026-05-10T10:00:00.000000Z",
  failed_at: null,
  refunded_at: null,
  metadata: {},
  created_at: null,
  updated_at: null,
};

describe("payment helpers", () => {
  it("formats payment amounts and statuses", () => {
    expect(formatPaymentAmount(payment)).toBe("ZAR 498.00");
    expect(paymentStatusLabel("succeeded")).toBe("Succeeded");
  });

  it("formats payment timeline labels", () => {
    expect(paymentTimelineLabel(payment)).toContain("Paid");
    expect(
      paymentTimelineLabel({
        ...payment,
        status: "failed",
        paid_at: null,
        failed_at: "2026-05-12T10:00:00.000000Z",
      }),
    ).toContain("Failed");
    expect(
      paymentTimelineLabel({
        ...payment,
        status: "pending",
        paid_at: null,
      }),
    ).toBe("Awaiting provider update");
  });
});
