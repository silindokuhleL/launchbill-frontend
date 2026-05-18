import type { Customer } from "@/types/customers";
import type { Plan } from "@/types/plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "canceled";

export type Subscription = {
  id: number;
  account_id: number;
  customer_id: number;
  plan_id: number;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  quantity: number;
  unit_price_cents: number;
  currency: "ZAR";
  starts_at: string | null;
  trial_ends_at: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown>;
  customer?: Customer;
  plan?: Plan;
  created_at: string | null;
  updated_at: string | null;
};

export type SubscriptionPayload = {
  customer_id: number;
  plan_id: number;
  provider_subscription_id?: string;
  status?: Exclude<SubscriptionStatus, "canceled">;
  quantity?: number;
  unit_price_cents?: number;
  currency?: "ZAR";
  starts_at?: string;
  trial_ends_at?: string;
  current_period_starts_at?: string;
  current_period_ends_at?: string;
  metadata?: Record<string, unknown>;
};

export type SubscriptionFormValues = {
  customer_id: string;
  plan_id: string;
  provider_subscription_id: string;
  status: Exclude<SubscriptionStatus, "canceled">;
  quantity: string;
  trial_ends_at: string;
  metadata_note: string;
};
