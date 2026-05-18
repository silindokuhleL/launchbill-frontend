import { api } from "@/lib/api";
import type { ApiCollection, ApiResource } from "@/types/api";
import type {
  Subscription,
  SubscriptionFormValues,
  SubscriptionPayload,
  SubscriptionStatus,
} from "@/types/subscriptions";

export async function listSubscriptions() {
  const response = await api.get<ApiCollection<Subscription>>("/subscriptions");

  return response.data.data;
}

export async function createSubscription(payload: SubscriptionPayload) {
  const response = await api.post<ApiResource<Subscription>>(
    "/subscriptions",
    payload,
  );

  return response.data.data;
}

export async function cancelSubscription(subscriptionId: number) {
  const response = await api.post<ApiResource<Subscription>>(
    `/subscriptions/${subscriptionId}/cancel`,
  );

  return response.data.data;
}

export async function resumeSubscription(subscriptionId: number) {
  const response = await api.post<ApiResource<Subscription>>(
    `/subscriptions/${subscriptionId}/resume`,
  );

  return response.data.data;
}

export function defaultSubscriptionFormValues(): SubscriptionFormValues {
  return {
    customer_id: "",
    plan_id: "",
    provider_subscription_id: "",
    status: "active",
    quantity: "1",
    trial_ends_at: "",
    metadata_note: "",
  };
}

export function formValuesToSubscriptionPayload(
  values: SubscriptionFormValues,
): SubscriptionPayload {
  return {
    customer_id: Number(values.customer_id),
    plan_id: Number(values.plan_id),
    provider_subscription_id: values.provider_subscription_id.trim() || undefined,
    status: values.status,
    quantity: Number(values.quantity || 1),
    trial_ends_at: values.trial_ends_at || undefined,
    metadata: values.metadata_note.trim()
      ? {
          note: values.metadata_note.trim(),
        }
      : undefined,
  };
}

export function formatSubscriptionAmount(
  subscription: Pick<Subscription, "currency" | "quantity" | "unit_price_cents">,
) {
  const amount = (subscription.unit_price_cents * subscription.quantity) / 100;

  return `${subscription.currency} ${amount.toFixed(2)}`;
}

export function statusLabel(status: SubscriptionStatus) {
  return status.replace("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}
