export type BillingInterval = "monthly" | "yearly";

export type Plan = {
  id: number;
  account_id: number;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  price: string;
  currency: "ZAR";
  billing_interval: BillingInterval;
  trial_days: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type PlanPayload = {
  name: string;
  slug?: string;
  description?: string;
  price_cents: number;
  currency?: "ZAR";
  billing_interval: BillingInterval;
  trial_days?: number;
  features?: string[];
  is_active?: boolean;
  sort_order?: number;
};

export type PlanFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  billing_interval: BillingInterval;
  trial_days: string;
  features: string;
  is_active: boolean;
  sort_order: string;
};
