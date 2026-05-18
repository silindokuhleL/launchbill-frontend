import { describe, expect, it } from "vitest";
import { formatPlanPrice, formValuesToPlanPayload, planToFormValues } from "@/lib/plans";
import type { Plan } from "@/types/plans";

const plan: Plan = {
  id: 1,
  account_id: 1,
  name: "Growth Billing",
  slug: "growth-billing",
  description: "Automated billing",
  price_cents: 24900,
  price: "249.00",
  currency: "ZAR",
  billing_interval: "monthly",
  trial_days: 14,
  features: ["Subscription billing", "Payment reminders"],
  is_active: true,
  sort_order: 20,
  created_at: null,
  updated_at: null,
};

describe("plans helpers", () => {
  it("maps a plan into form values", () => {
    expect(planToFormValues(plan)).toEqual({
      name: "Growth Billing",
      slug: "growth-billing",
      description: "Automated billing",
      price: "249",
      billing_interval: "monthly",
      trial_days: "14",
      features: "Subscription billing\nPayment reminders",
      is_active: true,
      sort_order: "20",
    });
  });

  it("maps form values into the API payload", () => {
    expect(
      formValuesToPlanPayload({
        name: " Founder Plan ",
        slug: "",
        description: " Early access ",
        price: "149.50",
        billing_interval: "yearly",
        trial_days: "7",
        features: "Feature one\n\nFeature two",
        is_active: false,
        sort_order: "5",
      }),
    ).toEqual({
      name: "Founder Plan",
      slug: undefined,
      description: "Early access",
      price_cents: 14950,
      currency: "ZAR",
      billing_interval: "yearly",
      trial_days: 7,
      features: ["Feature one", "Feature two"],
      is_active: false,
      sort_order: 5,
    });
  });

  it("formats plan price labels", () => {
    expect(formatPlanPrice(plan)).toBe("ZAR 249.00/mo");
    expect(formatPlanPrice({ ...plan, billing_interval: "yearly" })).toBe("ZAR 249.00/yr");
  });
});
