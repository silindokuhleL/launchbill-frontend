import { api } from "@/lib/api";
import type { ApiCollection, ApiResource } from "@/types/api";
import type { Plan, PlanFormValues, PlanPayload } from "@/types/plans";

export async function listPlans() {
  const response = await api.get<ApiCollection<Plan>>("/plans");

  return response.data.data;
}

export async function createPlan(payload: PlanPayload) {
  const response = await api.post<ApiResource<Plan>>("/plans", payload);

  return response.data.data;
}

export async function updatePlan(planId: number, payload: Partial<PlanPayload>) {
  const response = await api.patch<ApiResource<Plan>>(`/plans/${planId}`, payload);

  return response.data.data;
}

export async function archivePlan(planId: number) {
  await api.delete(`/plans/${planId}`);
}

export function planToFormValues(plan?: Plan): PlanFormValues {
  return {
    name: plan?.name ?? "",
    slug: plan?.slug ?? "",
    description: plan?.description ?? "",
    price: plan ? String(plan.price_cents / 100) : "",
    billing_interval: plan?.billing_interval ?? "monthly",
    trial_days: plan ? String(plan.trial_days) : "0",
    features: plan?.features.join("\n") ?? "",
    is_active: plan?.is_active ?? true,
    sort_order: plan ? String(plan.sort_order) : "0",
  };
}

export function formValuesToPlanPayload(values: PlanFormValues): PlanPayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || undefined,
    price_cents: Math.round(Number(values.price || 0) * 100),
    currency: "ZAR",
    billing_interval: values.billing_interval,
    trial_days: Number(values.trial_days || 0),
    features: values.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    is_active: values.is_active,
    sort_order: Number(values.sort_order || 0),
  };
}

export function formatPlanPrice(plan: Pick<Plan, "currency" | "price" | "billing_interval">) {
  const interval = plan.billing_interval === "monthly" ? "mo" : "yr";

  return `${plan.currency} ${plan.price}/${interval}`;
}
