"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, PackagePlus, Plus, Trash2 } from "lucide-react";
import { archivePlan, createPlan, formatPlanPrice, listPlans, updatePlan } from "@/lib/plans";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/error-messages";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { PlanFormModal } from "@/components/plans/plan-form-modal";
import type { Plan, PlanPayload } from "@/types/plans";

export function PlansClient() {
  const auth = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canManagePlans = Boolean(activeAccount?.permissions.includes("plans.manage"));
  const shouldShowPageError = Boolean(error && canManagePlans && !isLoading && plans.length === 0);

  const loadPlans = useCallback(async () => {
    if (!auth.activeAccountId || !canManagePlans) {
      setPlans([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setPlans(await listPlans());
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Could not load plans."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canManagePlans]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialPlans() {
      if (!auth.activeAccountId || !canManagePlans) {
        if (isMounted) {
          setPlans([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const nextPlans = await listPlans();

        if (isMounted) {
          setPlans(nextPlans);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(getApiErrorMessage(caughtError, "Could not load plans."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialPlans();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canManagePlans]);

  function openCreateModal() {
    setSelectedPlan(undefined);
    setIsModalOpen(true);
  }

  function openEditModal(plan: Plan) {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  }

  async function handleSubmit(payload: PlanPayload) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const savedPlan = selectedPlan
        ? await updatePlan(selectedPlan.id, payload)
        : await createPlan(payload);

      setSuccess(`${savedPlan.name} was ${selectedPlan ? "updated" : "created"}.`);
      setIsModalOpen(false);
      setSelectedPlan(undefined);
      await loadPlans();
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Could not save the plan."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(plan: Plan) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await archivePlan(plan.id);
      setSuccess(`${plan.name} was archived.`);
      await loadPlans();
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Could not archive the plan."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Billing setup"
        title="Plans"
        description="Create the pricing catalog customers will subscribe to."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canManagePlans ? (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New plan
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error && !shouldShowPageError ? (
          <Alert title="Plans need attention" message={error} tone="error" />
        ) : null}
        {success ? <Alert title="Plans updated" message={success} tone="success" /> : null}
      </div>

      {!canManagePlans ? (
        <div className="mt-5">
          <EmptyState
            description="This account role can view billing basics, but plan management is reserved for owners or billing admins with the plans.manage permission."
            icon={PackagePlus}
            title="Plan management is restricted"
          />
        </div>
      ) : shouldShowPageError && error ? (
        <div className="mt-5">
          <ErrorState
            actionLabel="plans"
            isRetrying={isLoading}
            message={error}
            onRetry={loadPlans}
            title="Plans could not load"
          />
        </div>
      ) : isLoading ? (
        <PlanSkeleton />
      ) : plans.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Create the first plan before adding subscriptions. Plans store price, billing interval, trial days, and the customer-facing feature list."
            icon={PackagePlus}
            title="No plans yet"
          >
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create first plan
            </Button>
          </EmptyState>
        </div>
      ) : (
        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
              key={plan.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[#102019]">{plan.name}</h2>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                        plan.is_active
                          ? "bg-[#e5f4eb] text-[var(--brand-dark)]"
                          : "bg-[#f4ebe8] text-[#8f2a1f]"
                      }`}
                    >
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-sm font-semibold text-[var(--muted)]">
                    {plan.slug}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[var(--brand-dark)]">
                  {formatPlanPrice(plan)}
                </p>
              </div>

              {plan.description ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {plan.description}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#365548]">
                <span className="rounded-md bg-[#edf5f0] px-3 py-1">
                  {plan.trial_days} trial days
                </span>
                <span className="rounded-md bg-[#edf5f0] px-3 py-1">
                  Sort {plan.sort_order}
                </span>
              </div>

              {plan.features.length ? (
                <ul className="mt-4 grid gap-2 text-sm text-[#102019]">
                  {plan.features.map((feature) => (
                    <li className="flex gap-2" key={feature}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={() => openEditModal(plan)}
                  variant="secondary"
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={() => handleArchive(plan)}
                  variant="danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Archive
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}

      <PlanFormModal
        key={selectedPlan?.id ?? "create-plan"}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        plan={selectedPlan}
      />
    </>
  );
}

function PlanSkeleton() {
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          className="h-56 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
    </section>
  );
}
