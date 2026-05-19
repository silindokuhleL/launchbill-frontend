"use client";

import { X } from "lucide-react";
import {
  formatPaymentAmount,
  paymentStatusLabel,
  paymentTimelineLabel,
} from "@/lib/payments";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types/payments";

type PaymentDetailModalProps = {
  isLoading: boolean;
  onClose: () => void;
  payment: Payment;
};

export function PaymentDetailModal({
  isLoading,
  onClose,
  payment,
}: PaymentDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#071b12]/45 p-0 sm:place-items-center sm:p-6">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-lg sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Payment detail
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              {payment.provider_payment_id ?? `Payment #${payment.id}`}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
              {payment.customer?.name ?? `Customer #${payment.customer_id}`}
            </p>
          </div>
          <button
            aria-label="Close payment details"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[#102019] transition hover:bg-[#eef7f1]"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DetailMetric label="Status" value={paymentStatusLabel(payment.status)} />
          <DetailMetric label="Amount" value={formatPaymentAmount(payment)} />
          <DetailMetric label="Provider" value={payment.provider.toUpperCase()} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailMetric
            label="Invoice"
            value={payment.invoice?.number ?? `#${payment.invoice_id}`}
          />
          <DetailMetric label="Timeline" value={paymentTimelineLabel(payment)} />
          <DetailMetric label="Paid" value={formatDate(payment.paid_at) ?? "Not paid"} />
          <DetailMetric
            label="Failed"
            value={formatDate(payment.failed_at) ?? "No failure"}
          />
        </div>

        {payment.failure_reason ? (
          <div className="mt-6 rounded-md border border-[#f3b4ae] bg-[#fff1f0] p-4 text-sm text-[#9b1c12]">
            <p className="font-bold">Failure reason</p>
            <p className="mt-1 leading-6">{payment.failure_reason}</p>
          </div>
        ) : null}

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
