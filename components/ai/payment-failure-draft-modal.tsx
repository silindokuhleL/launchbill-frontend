"use client";

import { useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import {
  generatePaymentFailureDraft,
  paymentFailureDraftToEditableText,
} from "@/lib/ai";
import { formatPaymentAmount } from "@/lib/payments";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types/payments";

type PaymentFailureDraftModalProps = {
  onClose: () => void;
  payment: Payment;
};

export function PaymentFailureDraftModal({
  onClose,
  payment,
}: PaymentFailureDraftModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [nextActions, setNextActions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const draft = generatePaymentFailureDraft(payment);

      setDraftText(paymentFailureDraftToEditableText(draft));
      setNextActions(draft.nextActions);
    } catch {
      setError("Could not draft the payment follow-up message.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#07130d]/70 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              AI follow-up assistant
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#102019]">
              Failed payment draft
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Generate an editable customer message for this failed payment.
            </p>
          </div>
          <button
            aria-label="Close payment failure draft"
            className="rounded-md p-2 text-[#102019] transition hover:bg-[#e5f1e9]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-md bg-[#f4fbf6] p-4 text-sm text-[#102019] sm:grid-cols-3">
          <DraftMetric label="Customer" value={payment.customer?.name ?? "Not linked"} />
          <DraftMetric label="Amount" value={formatPaymentAmount(payment)} />
          <DraftMetric
            label="Invoice"
            value={payment.invoice?.number ?? `#${payment.invoice_id}`}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-[#f3b8b1] bg-[#fff5f3] p-3 text-sm font-semibold text-[#8f2a1f]">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button isLoading={isGenerating} onClick={handleGenerate}>
            <Bot className="h-4 w-4" aria-hidden="true" />
            Generate draft
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>

        {draftText ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
            <label className="block">
              <span className="text-sm font-bold text-[#102019]">
                Review and edit message
              </span>
              <textarea
                className="mt-2 min-h-80 w-full resize-y rounded-md border border-[var(--border)] bg-[#fbfdfc] p-4 text-sm leading-6 text-[#102019] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#b7d8c3]"
                onChange={(event) => setDraftText(event.target.value)}
                value={draftText}
              />
            </label>

            <div className="rounded-md bg-[#f4fbf6] p-4">
              <p className="text-sm font-bold text-[#102019]">Before using</p>
              <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted)]">
                {nextActions.map((action) => (
                  <li className="flex gap-2" key={action}>
                    <Sparkles
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]"
                      aria-hidden="true"
                    />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4 text-sm leading-6 text-[var(--muted)]">
            The assistant will prepare a draft only after you ask for it. Nothing is
            sent automatically.
          </div>
        )}
      </section>
    </div>
  );
}

function DraftMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold">{value}</p>
    </div>
  );
}
