"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import {
  defaultSubscriptionFormValues,
  formValuesToSubscriptionPayload,
} from "@/lib/subscriptions";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/customers";
import type { Plan } from "@/types/plans";
import type {
  SubscriptionFormValues,
  SubscriptionPayload,
} from "@/types/subscriptions";

type SubscriptionFormModalProps = {
  customers: Customer[];
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SubscriptionPayload) => Promise<void>;
  plans: Plan[];
};

export function SubscriptionFormModal({
  customers,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  plans,
}: SubscriptionFormModalProps) {
  const [values, setValues] = useState<SubscriptionFormValues>(() => ({
    ...defaultSubscriptionFormValues(),
    customer_id: customers[0] ? String(customers[0].id) : "",
    plan_id: plans[0] ? String(plans[0].id) : "",
  }));

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(formValuesToSubscriptionPayload(values));
  }

  function updateValue<Key extends keyof SubscriptionFormValues>(
    key: Key,
    value: SubscriptionFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#071b12]/45 p-0 sm:place-items-center sm:p-6">
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-lg sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Billing lifecycle
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              Create subscription
            </h2>
          </div>
          <button
            aria-label="Close subscription form"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[#102019] transition hover:bg-[#eef7f1]"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-[#102019]">
            Customer
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("customer_id", event.target.value)}
              required
              value={values.customer_id}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Plan
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("plan_id", event.target.value)}
              required
              value={values.plan_id}
            >
              {plans
                .filter((plan) => plan.is_active)
                .map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Status
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) =>
                updateValue(
                  "status",
                  event.target.value as SubscriptionFormValues["status"],
                )
              }
              value={values.status}
            >
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past due</option>
              <option value="paused">Paused</option>
            </select>
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Quantity
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              min={1}
              onChange={(event) => updateValue("quantity", event.target.value)}
              required
              type="number"
              value={values.quantity}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Provider ID
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) =>
                updateValue("provider_subscription_id", event.target.value)
              }
              placeholder="Optional payment provider id"
              value={values.provider_subscription_id}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Trial ends
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("trial_ends_at", event.target.value)}
              type="date"
              value={values.trial_ends_at}
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-[#102019]">
          Internal note
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            onChange={(event) => updateValue("metadata_note", event.target.value)}
            value={values.metadata_note}
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={customers.length === 0 || plans.length === 0}
            isLoading={isSubmitting}
            type="submit"
          >
            Create subscription
          </Button>
        </div>
      </form>
    </div>
  );
}
