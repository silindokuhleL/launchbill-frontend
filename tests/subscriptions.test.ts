import { describe, expect, it } from "vitest";
import {
  defaultSubscriptionFormValues,
  formatSubscriptionAmount,
  formatSubscriptionDate,
  formatSubscriptionPeriod,
  formValuesToSubscriptionPayload,
  statusLabel,
} from "@/lib/subscriptions";

describe("subscription helpers", () => {
  it("returns default form values", () => {
    expect(defaultSubscriptionFormValues()).toEqual({
      customer_id: "",
      plan_id: "",
      provider_subscription_id: "",
      status: "active",
      quantity: "1",
      trial_ends_at: "",
      metadata_note: "",
    });
  });

  it("maps form values into an API payload", () => {
    expect(
      formValuesToSubscriptionPayload({
        customer_id: "10",
        plan_id: "20",
        provider_subscription_id: " sub_demo ",
        status: "trialing",
        quantity: "3",
        trial_ends_at: "2026-05-25",
        metadata_note: " Needs onboarding. ",
      }),
    ).toEqual({
      customer_id: 10,
      plan_id: 20,
      provider_subscription_id: "sub_demo",
      status: "trialing",
      quantity: 3,
      trial_ends_at: "2026-05-25",
      metadata: {
        note: "Needs onboarding.",
      },
    });
  });

  it("formats subscription amount and status labels", () => {
    expect(
      formatSubscriptionAmount({
        currency: "ZAR",
        quantity: 2,
        unit_price_cents: 24900,
      }),
    ).toBe("ZAR 498.00");
    expect(statusLabel("past_due")).toBe("Past due");
  });

  it("formats subscription dates and periods", () => {
    expect(formatSubscriptionDate("2026-05-24T10:00:00.000000Z")).toContain("2026");
    expect(formatSubscriptionDate(null)).toBeNull();
    expect(
      formatSubscriptionPeriod(
        "2026-05-01T10:00:00.000000Z",
        "2026-05-31T10:00:00.000000Z",
      ),
    ).toContain("to");
    expect(formatSubscriptionPeriod(null, "2026-05-31T10:00:00.000000Z")).toBe(
      "Not set",
    );
  });
});
