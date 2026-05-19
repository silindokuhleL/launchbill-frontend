"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { CreditCard, Eye, RefreshCcw } from "lucide-react";
import {
  formatPaymentAmount,
  getPayment,
  listPayments,
  paymentStatusLabel,
  paymentTimelineLabel,
} from "@/lib/payments";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentDetailModal } from "@/components/payments/payment-detail-modal";
import type { Payment, PaymentStatus } from "@/types/payments";

const statusStyles: Record<PaymentStatus, string> = {
  failed: "bg-[#f4ebe8] text-[#8f2a1f]",
  pending: "bg-[#fff4df] text-[#8a4a00]",
  refunded: "bg-[#edf1f5] text-[#344054]",
  succeeded: "bg-[#e5f4eb] text-[var(--brand-dark)]",
};

export function PaymentsClient() {
  const auth = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canViewPayments = Boolean(
    activeAccount?.permissions.includes("payments.view"),
  );

  const loadPayments = useCallback(async () => {
    if (!auth.activeAccountId || !canViewPayments) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setPayments(await listPayments());
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load payments."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canViewPayments]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialPayments() {
      if (!auth.activeAccountId || !canViewPayments) {
        if (isMounted) {
          setPayments([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const nextPayments = await listPayments();

        if (isMounted) {
          setPayments(nextPayments);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load payments."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialPayments();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canViewPayments]);

  async function openPayment(payment: Payment) {
    setSelectedPayment(payment);
    setIsDetailLoading(true);
    setError(null);

    try {
      setSelectedPayment(await getPayment(payment.id));
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load payment details."));
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Provider payments"
        title="Payments"
        description="Review provider payment attempts, failures, and invoice settlement evidence."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canViewPayments ? (
          <Button onClick={loadPayments} variant="secondary">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Payments need attention" message={error} tone="error" />
        ) : null}
      </div>

      {!canViewPayments ? (
        <div className="mt-5">
          <EmptyState
            description="This account role cannot view payment records. Payment visibility is controlled by the payments.view permission."
            icon={CreditCard}
            title="Payment access is restricted"
          />
        </div>
      ) : isLoading ? (
        <PaymentSkeleton />
      ) : payments.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Payments will appear here once PayFast or another provider sends payment events."
            icon={CreditCard}
            title="No payments yet"
          />
        </div>
      ) : (
        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          {payments.map((payment) => (
            <article
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
              key={payment.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[#102019]">
                      {payment.provider_payment_id ?? `Payment #${payment.id}`}
                    </h2>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                        statusStyles[payment.status]
                      }`}
                    >
                      {paymentStatusLabel(payment.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {payment.customer?.name ?? `Customer #${payment.customer_id}`}
                  </p>
                </div>
                <span className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                  {payment.provider.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[#102019] sm:grid-cols-2">
                <PaymentMetric label="Amount" value={formatPaymentAmount(payment)} />
                <PaymentMetric
                  label="Invoice"
                  value={payment.invoice?.number ?? `#${payment.invoice_id}`}
                />
                <PaymentMetric label="Timeline" value={paymentTimelineLabel(payment)} />
                <PaymentMetric
                  label="Failure"
                  value={payment.failure_reason ?? "No failure recorded"}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  disabled={isDetailLoading}
                  onClick={() => openPayment(payment)}
                  variant="secondary"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View details
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedPayment ? (
        <PaymentDetailModal
          isLoading={isDetailLoading}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
        />
      ) : null}
    </>
  );
}

function PaymentMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          className="h-60 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
    </section>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
