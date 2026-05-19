"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  FileText,
  RefreshCcw,
  RotateCcw,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  cancelSubscription,
  formatSubscriptionAmount,
  formatSubscriptionDate,
  formatSubscriptionPeriod,
  getSubscription,
  resumeSubscription,
  statusLabel,
} from "@/lib/subscriptions";
import {
  formatInvoiceAmount,
  invoiceBalanceCents,
  invoiceStatusLabel,
  listInvoices,
} from "@/lib/invoices";
import { formatPaymentAmount, listPayments, paymentStatusLabel } from "@/lib/payments";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";
import type { Subscription, SubscriptionStatus } from "@/types/subscriptions";

type SubscriptionDetailClientProps = {
  subscriptionId: number;
};

type SubscriptionBillingData = {
  invoices: Invoice[];
  payments: Payment[];
};

const subscriptionStatusStyles: Record<SubscriptionStatus, string> = {
  active: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  canceled: "bg-[#f4ebe8] text-[#8f2a1f]",
  past_due: "bg-[#fff4df] text-[#8a4a00]",
  paused: "bg-[#edf1f5] text-[#344054]",
  trialing: "bg-[#e6f5ff] text-[#075985]",
};

const invoiceStatusStyles = {
  draft: "bg-[#edf1f5] text-[#344054]",
  open: "bg-[#e6f5ff] text-[#075985]",
  overdue: "bg-[#fff4df] text-[#8a4a00]",
  paid: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  void: "bg-[#f4ebe8] text-[#8f2a1f]",
};

const paymentStatusStyles = {
  pending: "bg-[#e6f5ff] text-[#075985]",
  succeeded: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  failed: "bg-[#fff4df] text-[#8a4a00]",
  refunded: "bg-[#edf1f5] text-[#344054]",
};

export function SubscriptionDetailClient({
  subscriptionId,
}: SubscriptionDetailClientProps) {
  const auth = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingData, setBillingData] = useState<SubscriptionBillingData>({
    invoices: [],
    payments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canManageSubscriptions = Boolean(
    activeAccount?.permissions.includes("subscriptions.manage"),
  );
  const canViewInvoices = Boolean(activeAccount?.permissions.includes("invoices.view"));
  const canViewPayments = Boolean(activeAccount?.permissions.includes("payments.view"));

  const loadDetail = useCallback(async () => {
    if (
      !auth.activeAccountId ||
      !canManageSubscriptions ||
      !Number.isFinite(subscriptionId)
    ) {
      setSubscription(null);
      setBillingData({ invoices: [], payments: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextSubscription, nextInvoices, nextPayments] = await Promise.all([
        getSubscription(subscriptionId),
        canViewInvoices ? listInvoices() : Promise.resolve([]),
        canViewPayments ? listPayments() : Promise.resolve([]),
      ]);
      const relatedInvoices = nextInvoices.filter(
        (invoice) => invoice.subscription_id === subscriptionId,
      );
      const relatedInvoiceIds = new Set(relatedInvoices.map((invoice) => invoice.id));

      setSubscription(nextSubscription);
      setBillingData({
        invoices: relatedInvoices,
        payments: nextPayments.filter(
          (payment) =>
            relatedInvoiceIds.has(payment.invoice_id) ||
            payment.invoice?.subscription_id === subscriptionId,
        ),
      });
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load subscription detail."));
    } finally {
      setIsLoading(false);
    }
  }, [
    auth.activeAccountId,
    canManageSubscriptions,
    canViewInvoices,
    canViewPayments,
    subscriptionId,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (
        !auth.activeAccountId ||
        !canManageSubscriptions ||
        !Number.isFinite(subscriptionId)
      ) {
        if (isMounted) {
          setSubscription(null);
          setBillingData({ invoices: [], payments: [] });
          setIsLoading(false);
        }

        return;
      }

      try {
        const [nextSubscription, nextInvoices, nextPayments] = await Promise.all([
          getSubscription(subscriptionId),
          canViewInvoices ? listInvoices() : Promise.resolve([]),
          canViewPayments ? listPayments() : Promise.resolve([]),
        ]);
        const relatedInvoices = nextInvoices.filter(
          (invoice) => invoice.subscription_id === subscriptionId,
        );
        const relatedInvoiceIds = new Set(relatedInvoices.map((invoice) => invoice.id));

        if (isMounted) {
          setSubscription(nextSubscription);
          setBillingData({
            invoices: relatedInvoices,
            payments: nextPayments.filter(
              (payment) =>
                relatedInvoiceIds.has(payment.invoice_id) ||
                payment.invoice?.subscription_id === subscriptionId,
            ),
          });
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load subscription detail."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [
    auth.activeAccountId,
    canManageSubscriptions,
    canViewInvoices,
    canViewPayments,
    reloadKey,
    subscriptionId,
  ]);

  const metrics = useMemo(() => {
    const outstandingCents = billingData.invoices.reduce(
      (total, invoice) => total + invoiceBalanceCents(invoice),
      0,
    );
    const paidCents = billingData.payments
      .filter((payment) => payment.status === "succeeded")
      .reduce((total, payment) => total + payment.amount_cents, 0);

    return [
      {
        icon: FileText,
        label: "Invoices",
        value: String(billingData.invoices.length),
      },
      {
        icon: CreditCard,
        label: "Payments",
        value: String(billingData.payments.length),
      },
      {
        icon: WalletCards,
        label: "Outstanding",
        value: `ZAR ${(outstandingCents / 100).toFixed(2)}`,
      },
      {
        icon: CalendarClock,
        label: "Paid revenue",
        value: `ZAR ${(paidCents / 100).toFixed(2)}`,
      },
    ];
  }, [billingData.invoices, billingData.payments]);

  async function handleCancel() {
    if (!subscription) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const canceledSubscription = await cancelSubscription(subscription.id);

      setSubscription(canceledSubscription);
      setSuccess("Subscription was canceled.");
      await loadDetail();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not cancel the subscription."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResume() {
    if (!subscription) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const resumedSubscription = await resumeSubscription(subscription.id);

      setSubscription(resumedSubscription);
      setSuccess("Subscription was resumed.");
      await loadDetail();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not resume the subscription."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-5">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-dark)] hover:text-[var(--brand)]"
          href="/subscriptions"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to subscriptions
        </Link>
      </div>

      <PageHeader
        eyebrow="Subscription lifecycle"
        title={subscription?.customer?.name ?? "Subscription detail"}
        description="Review the customer, plan, billing period, invoices, and payments connected to one subscription."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canManageSubscriptions ? (
          <Button onClick={() => setReloadKey((value) => value + 1)} variant="secondary">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Subscription detail needs attention" message={error} tone="error" />
        ) : null}
        {success ? (
          <Alert title="Subscription updated" message={success} tone="success" />
        ) : null}
      </div>

      {!canManageSubscriptions ? (
        <div className="mt-5">
          <EmptyState
            description="This account role cannot manage subscriptions. Subscription detail access is controlled by the subscriptions.manage permission."
            icon={CalendarClock}
            title="Subscription access is restricted"
          />
        </div>
      ) : isLoading ? (
        <SubscriptionDetailSkeleton />
      ) : !subscription ? (
        <div className="mt-5">
          <EmptyState
            description="The subscription could not be found for this account."
            icon={CalendarClock}
            title="Subscription not found"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6">
          <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-[#102019]">
                    {subscription.customer?.name ?? `Customer #${subscription.customer_id}`}
                  </h2>
                  <StatusBadge
                    className={subscriptionStatusStyles[subscription.status]}
                    label={statusLabel(subscription.status)}
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  {subscription.plan?.name ?? `Plan #${subscription.plan_id}`}
                </p>
              </div>
              {subscription.provider_subscription_id ? (
                <span className="w-fit max-w-full break-all rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                  {subscription.provider_subscription_id}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-[#102019] md:grid-cols-2">
              <DetailMetric
                label="Amount"
                value={formatSubscriptionAmount(subscription)}
              />
              <DetailMetric label="Quantity" value={String(subscription.quantity)} />
              <DetailMetric
                label="Current period"
                value={formatSubscriptionPeriod(
                  subscription.current_period_starts_at,
                  subscription.current_period_ends_at,
                )}
              />
              <DetailMetric
                label="Trial ends"
                value={formatSubscriptionDate(subscription.trial_ends_at) ?? "No trial"}
              />
              <DetailMetric
                label="Started"
                value={formatSubscriptionDate(subscription.starts_at) ?? "Not set"}
              />
              <DetailMetric
                label="Ended"
                value={
                  formatSubscriptionDate(subscription.ended_at) ??
                  formatSubscriptionDate(subscription.canceled_at) ??
                  "Still active"
                }
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {subscription.status === "canceled" ? (
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={handleResume}
                  variant="secondary"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Resume
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                  variant="danger"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </Button>
              )}
              {subscription.customer ? (
                <Link
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[#102019] transition hover:bg-[#eef7f1] sm:w-auto"
                  href={`/customers/${subscription.customer.id}`}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Customer profile
                </Link>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
                key={metric.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {metric.label}
                  </p>
                  <metric.icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                </div>
                <p className="mt-3 text-2xl font-bold text-[#102019]">{metric.value}</p>
              </div>
            ))}
          </section>

          <RelatedInvoices invoices={billingData.invoices} />
          <RelatedPayments payments={billingData.payments} />
        </div>
      )}
    </>
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

function RelatedInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <SectionHeading
        description="Billing documents generated from this subscription."
        title="Invoices"
      />
      {invoices.length === 0 ? (
        <SmallEmpty icon={FileText} title="No invoices for this subscription yet." />
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {invoices.map((invoice) => (
            <article className="rounded-md border border-[#d8e7dd] p-4" key={invoice.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#102019]">{invoice.number}</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {formatInvoiceAmount(invoice)}
                  </p>
                </div>
                <StatusBadge
                  className={invoiceStatusStyles[invoice.status]}
                  label={invoiceStatusLabel(invoice.status)}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <DetailMetric
                  label="Balance"
                  value={`ZAR ${(invoiceBalanceCents(invoice) / 100).toFixed(2)}`}
                />
                <DetailMetric
                  label="Due"
                  value={formatSubscriptionDate(invoice.due_at) ?? "Not set"}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedPayments({ payments }: { payments: Payment[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <SectionHeading
        description="Payment attempts attached through the subscription invoices."
        title="Payments"
      />
      {payments.length === 0 ? (
        <SmallEmpty icon={CreditCard} title="No payments for this subscription yet." />
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {payments.map((payment) => (
            <article className="rounded-md border border-[#d8e7dd] p-4" key={payment.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#102019]">
                    {payment.provider_payment_id ?? `Payment #${payment.id}`}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {formatPaymentAmount(payment)}
                  </p>
                </div>
                <StatusBadge
                  className={paymentStatusStyles[payment.status]}
                  label={paymentStatusLabel(payment.status)}
                />
              </div>
              {payment.failure_reason ? (
                <p className="mt-4 rounded-md bg-[#fff8ec] p-3 text-sm font-semibold text-[#8a4a00]">
                  {payment.failure_reason}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
        Subscription billing
      </p>
      <h2 className="mt-2 text-xl font-bold text-[#102019]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function StatusBadge({ className, label }: { className: string; label: string }) {
  return (
    <span className={`w-fit shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function SmallEmpty({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4 text-sm font-semibold text-[var(--muted)]">
      <Icon className="h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
      <span>{title}</span>
    </div>
  );
}

function SubscriptionDetailSkeleton() {
  return (
    <div className="mt-5 grid gap-6">
      <div className="h-80 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
            key={item}
          />
        ))}
      </div>
      {[0, 1].map((item) => (
        <div
          className="h-56 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
