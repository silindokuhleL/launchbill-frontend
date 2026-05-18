"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import {
  customerToFormValues,
  formValuesToCustomerPayload,
} from "@/lib/customers";
import { Button } from "@/components/ui/button";
import type {
  Customer,
  CustomerFormValues,
  CustomerPayload,
} from "@/types/customers";

type CustomerFormModalProps = {
  customer?: Customer;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
};

export function CustomerFormModal({
  customer,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CustomerFormModalProps) {
  const [values, setValues] = useState<CustomerFormValues>(() =>
    customerToFormValues(customer),
  );

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(formValuesToCustomerPayload(values));
  }

  function updateValue<Key extends keyof CustomerFormValues>(
    key: Key,
    value: CustomerFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#071b12]/45 p-0 sm:place-items-center sm:p-6">
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-lg sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Customer record
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              {customer ? "Edit customer" : "Create customer"}
            </h2>
          </div>
          <button
            aria-label="Close customer form"
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
            Customer name
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("name", event.target.value)}
              required
              value={values.name}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Email
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("email", event.target.value)}
              required
              type="email"
              value={values.email}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Company
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("company_name", event.target.value)}
              value={values.company_name}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Phone
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) => updateValue("phone", event.target.value)}
              value={values.phone}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Provider ID
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) =>
                updateValue("provider_customer_id", event.target.value)
              }
              placeholder="Optional payment provider id"
              value={values.provider_customer_id}
            />
          </label>

          <label className="block text-sm font-bold text-[#102019]">
            Status
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
              onChange={(event) =>
                updateValue(
                  "status",
                  event.target.value as CustomerFormValues["status"],
                )
              }
              value={values.status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[#f8fbf9] p-4">
          <p className="text-sm font-bold text-[#102019]">Billing address</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#102019]">
              Address line
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                onChange={(event) => updateValue("line1", event.target.value)}
                value={values.line1}
              />
            </label>

            <label className="block text-sm font-bold text-[#102019]">
              City
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                onChange={(event) => updateValue("city", event.target.value)}
                value={values.city}
              />
            </label>

            <label className="block text-sm font-bold text-[#102019]">
              Region
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                onChange={(event) => updateValue("region", event.target.value)}
                value={values.region}
              />
            </label>

            <label className="block text-sm font-bold text-[#102019]">
              Postal code
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                onChange={(event) => updateValue("postal_code", event.target.value)}
                value={values.postal_code}
              />
            </label>

            <label className="block text-sm font-bold text-[#102019]">
              Country
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm uppercase outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                maxLength={2}
                onChange={(event) => updateValue("country", event.target.value)}
                value={values.country}
              />
            </label>
          </div>
        </div>

        <label className="mt-4 block text-sm font-bold text-[#102019]">
          Notes
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            onChange={(event) => updateValue("notes", event.target.value)}
            value={values.notes}
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            {customer ? "Save changes" : "Create customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
