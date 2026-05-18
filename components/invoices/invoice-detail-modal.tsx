"use client";

import { X } from "lucide-react";
import {
  formatInvoiceAmount,
  formatLineItemAmount,
  invoiceBalanceCents,
  invoiceStatusLabel,
} from "@/lib/invoices";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/types/invoices";

type InvoiceDetailModalProps = {
  invoice: Invoice;
  isLoading: boolean;
  onClose: () => void;
};

export function InvoiceDetailModal({
  invoice,
  isLoading,
  onClose,
}: InvoiceDetailModalProps) {
  const balance = invoiceBalanceCents(invoice);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#071b12]/45 p-0 sm:place-items-center sm:p-6">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-lg sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Invoice detail
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              {invoice.number}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
              {invoice.customer?.name ?? `Customer #${invoice.customer_id}`}
            </p>
          </div>
          <button
            aria-label="Close invoice details"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[#102019] transition hover:bg-[#eef7f1]"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DetailMetric label="Status" value={invoiceStatusLabel(invoice.status)} />
          <DetailMetric label="Amount due" value={formatInvoiceAmount(invoice)} />
          <DetailMetric label="Balance" value={`ZAR ${(balance / 100).toFixed(2)}`} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailMetric label="Issued" value={formatDate(invoice.issued_at) ?? "Not issued"} />
          <DetailMetric label="Due" value={formatDate(invoice.due_at) ?? "No due date"} />
          <DetailMetric label="Paid" value={formatDate(invoice.paid_at) ?? "Not paid"} />
          <DetailMetric
            label="Subscription"
            value={
              invoice.subscription?.provider_subscription_id ??
              (invoice.subscription_id ? `#${invoice.subscription_id}` : "Not attached")
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)]">
          <div className="bg-[#f4fbf6] px-4 py-3 text-sm font-bold text-[#102019]">
            Line items
          </div>
          <div className="divide-y divide-[var(--border)]">
            {invoice.line_items.map((lineItem, index) => (
              <div
                className="grid gap-2 px-4 py-3 text-sm text-[#102019] sm:grid-cols-[1fr_auto]"
                key={`${lineItem.description}-${index}`}
              >
                <div>
                  <p className="font-bold">{lineItem.description}</p>
                  <p className="mt-1 text-[var(--muted)]">
                    Qty {lineItem.quantity} at ZAR{" "}
                    {(lineItem.unit_price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <p className="font-bold">{formatLineItemAmount(lineItem)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        </div>
      </section>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
  }).format(new Date(value));
}
