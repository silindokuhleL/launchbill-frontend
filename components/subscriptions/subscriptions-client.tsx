"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  CalendarClock,
  Plus,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";
import { listCustomers } from "@/lib/customers";
import { listPlans } from "@/lib/plans";
import {
  cancelSubscription,
  createSubscription,
  formatSubscriptionAmount,
  listSubscriptions,
  resumeSubscription,
  statusLabel,
} from "@/lib/subscriptions";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SubscriptionFormModal } from "@/components/subscriptions/subscription-form-modal";
import type { Customer } from "@/types/customers";
import type { Plan } from "@/types/plans";
import type {
  Subscription,
  SubscriptionPayload,
  SubscriptionStatus,
} from "@/types/subscriptions";

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  canceled: "bg-[#f4ebe8] text-[#8f2a1f]",
  past_due: "bg-[#fff4df] text-[#8a4a00]",
  paused: "bg-[#edf1f5] text-[#344054]",
  trialing: "bg-[#e6f5ff] text-[#075985]",
};

export function SubscriptionsClient() {
  const auth = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canManageSubscriptions = Boolean(
    activeAccount?.permissions.includes("subscriptions.manage"),
  );

  const loadSubscriptions = useCallback(async () => {
    if (!auth.activeAccountId || !canManageSubscriptions) {
      setCustomers([]);
      setPlans([]);
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextSubscriptions, nextCustomers, nextPlans] = await Promise.all([
        listSubscriptions(),
        listCustomers(),
        listPlans(),
      ]);

      setSubscriptions(nextSubscriptions);
      setCustomers(nextCustomers);
      setPlans(nextPlans);
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load subscriptions."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canManageSubscriptions]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialSubscriptions() {
      if (!auth.activeAccountId || !canManageSubscriptions) {
        if (isMounted) {
          setCustomers([]);
          setPlans([]);
          setSubscriptions([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const [nextSubscriptions, nextCustomers, nextPlans] = await Promise.all([
          listSubscriptions(),
          listCustomers(),
          listPlans(),
        ]);

        if (isMounted) {
          setSubscriptions(nextSubscriptions);
          setCustomers(nextCustomers);
          setPlans(nextPlans);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load subscriptions."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canManageSubscriptions]);

  async function handleSubmit(payload: SubscriptionPayload) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const savedSubscription = await createSubscription(payload);

      setSuccess(
        `${savedSubscription.customer?.name ?? "Subscription"} was created.`,
      );
      setIsModalOpen(false);
      await loadSubscriptions();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not create the subscription."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(subscription: Subscription) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const canceledSubscription = await cancelSubscription(subscription.id);

      setSuccess(
        `${canceledSubscription.customer?.name ?? "Subscription"} was canceled.`,
      );
      await loadSubscriptions();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not cancel the subscription."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResume(subscription: Subscription) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const resumedSubscription = await resumeSubscription(subscription.id);

      setSuccess(
        `${resumedSubscription.customer?.name ?? "Subscription"} was resumed.`,
      );
      await loadSubscriptions();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not resume the subscription."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Recurring billing"
        title="Subscriptions"
        description="Track customer-plan relationships, billing periods, and subscription state transitions."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canManageSubscriptions ? (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New subscription
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Subscriptions need attention" message={error} tone="error" />
        ) : null}
        {success ? (
          <Alert title="Subscriptions updated" message={success} tone="success" />
        ) : null}
      </div>

      {!canManageSubscriptions ? (
        <div className="mt-5">
          <EmptyState
            description="This account role can view billing basics, but subscription management is reserved for users with the subscriptions.manage permission."
            icon={Users}
            title="Subscription management is restricted"
          />
        </div>
      ) : isLoading ? (
        <SubscriptionSkeleton />
      ) : subscriptions.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Create a subscription when a customer chooses a plan. Subscriptions connect future invoices, payments, and lifecycle events."
            icon={CalendarClock}
            title="No subscriptions yet"
          >
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create first subscription
            </Button>
          </EmptyState>
        </div>
      ) : (
        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          {subscriptions.map((subscription) => (
            <article
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
              key={subscription.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[#102019]">
                      {subscription.customer?.name ?? `Customer #${subscription.customer_id}`}
                    </h2>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                        statusStyles[subscription.status]
                      }`}
                    >
                      {statusLabel(subscription.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {subscription.plan?.name ?? `Plan #${subscription.plan_id}`}
                  </p>
                </div>
                {subscription.provider_subscription_id ? (
                  <span className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                    {subscription.provider_subscription_id}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[#102019] sm:grid-cols-2">
                <SubscriptionMetric
                  label="Amount"
                  value={formatSubscriptionAmount(subscription)}
                />
                <SubscriptionMetric label="Quantity" value={String(subscription.quantity)} />
                <SubscriptionMetric
                  label="Current period"
                  value={formatPeriod(
                    subscription.current_period_starts_at,
                    subscription.current_period_ends_at,
                  )}
                />
                <SubscriptionMetric
                  label="Trial ends"
                  value={formatDate(subscription.trial_ends_at) ?? "No trial"}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {subscription.status === "canceled" ? (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() => handleResume(subscription)}
                    variant="secondary"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() => handleCancel(subscription)}
                    variant="danger"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Cancel
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {isModalOpen ? (
        <SubscriptionFormModal
          customers={customers}
          isOpen={isModalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          plans={plans}
        />
      ) : null}
    </>
  );
}

function SubscriptionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          className="h-64 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
    </section>
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

function formatPeriod(startsAt: string | null, endsAt: string | null) {
  const start = formatDate(startsAt);
  const end = formatDate(endsAt);

  if (!start || !end) {
    return "Not set";
  }

  return `${start} to ${end}`;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
