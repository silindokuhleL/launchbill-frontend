"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { formValuesToPlanPayload, planToFormValues } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import type { Plan, PlanFormValues, PlanPayload } from "@/types/plans";

type PlanFormModalProps = {
  isOpen: boolean;
  plan?: Plan;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PlanPayload) => Promise<void>;
};

export function PlanFormModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  plan,
}: PlanFormModalProps) {
  const [values, setValues] = useState<PlanFormValues>(() => planToFormValues(plan));

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(formValuesToPlanPayload(values));
  }

  function updateValue<Key extends keyof PlanFormValues>(
    key: Key,
    value: PlanFormValues[Key],
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
              Plan catalog
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              {plan ? "Edit plan" : "Create plan"}
            </h2>
          </div>
          <button
            aria-label="Close plan form"
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
            Plan name
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("name", event.target.value)}
              required
              value={values.name}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Slug
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("slug", event.target.value)}
              placeholder="auto-generated"
              value={values.slug}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Price
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              min="0"
              onChange={(event) => updateValue("price", event.target.value)}
              required
              step="0.01"
              type="number"
              value={values.price}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Billing interval
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) =>
                updateValue("billing_interval", event.target.value as PlanFormValues["billing_interval"])
              }
              value={values.billing_interval}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Trial days
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              min="0"
              onChange={(event) => updateValue("trial_days", event.target.value)}
              type="number"
              value={values.trial_days}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Sort order
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              min="0"
              onChange={(event) => updateValue("sort_order", event.target.value)}
              type="number"
              value={values.sort_order}
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-[#102019]">
          Description
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            onChange={(event) => updateValue("description", event.target.value)}
            value={values.description}
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-[#102019]">
          Features
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            onChange={(event) => updateValue("features", event.target.value)}
            placeholder="One feature per line"
            value={values.features}
          />
        </label>

        <label className="mt-4 flex items-center gap-3 text-sm font-bold text-[#102019]">
          <input
            checked={values.is_active}
            className="h-5 w-5 accent-[var(--brand)]"
            onChange={(event) => updateValue("is_active", event.target.checked)}
            type="checkbox"
          />
          Active plan
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            {plan ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
