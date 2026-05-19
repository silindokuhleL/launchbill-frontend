"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Edit3,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  archiveCustomer,
  createCustomer,
  formatCustomerAddress,
  listCustomers,
  updateCustomer,
} from "@/lib/customers";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { CustomerFormModal } from "@/components/customers/customer-form-modal";
import type { Customer, CustomerPayload } from "@/types/customers";

export function CustomersClient() {
  const auth = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canManageCustomers = Boolean(
    activeAccount?.permissions.includes("customers.manage"),
  );

  const loadCustomers = useCallback(async () => {
    if (!auth.activeAccountId || !canManageCustomers) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCustomers(await listCustomers());
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load customers."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canManageCustomers]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialCustomers() {
      if (!auth.activeAccountId || !canManageCustomers) {
        if (isMounted) {
          setCustomers([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const nextCustomers = await listCustomers();

        if (isMounted) {
          setCustomers(nextCustomers);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load customers."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialCustomers();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canManageCustomers]);

  function openCreateModal() {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  }

  async function handleSubmit(payload: CustomerPayload) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const savedCustomer = selectedCustomer
        ? await updateCustomer(selectedCustomer.id, payload)
        : await createCustomer(payload);

      setSuccess(
        `${savedCustomer.name} was ${selectedCustomer ? "updated" : "created"}.`,
      );
      setIsModalOpen(false);
      setSelectedCustomer(undefined);
      await loadCustomers();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not save the customer."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(customer: Customer) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await archiveCustomer(customer.id);
      setSuccess(`${customer.name} was archived.`);
      await loadCustomers();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not archive the customer."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Billing relationships"
        title="Customers"
        description="Manage the customer records that subscriptions, invoices, and payments will attach to."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canManageCustomers ? (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New customer
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Customers need attention" message={error} tone="error" />
        ) : null}
        {success ? (
          <Alert title="Customers updated" message={success} tone="success" />
        ) : null}
      </div>

      {!canManageCustomers ? (
        <div className="mt-5">
          <EmptyState
            description="This account role can view billing basics, but customer management is reserved for users with the customers.manage permission."
            icon={Users}
            title="Customer management is restricted"
          />
        </div>
      ) : isLoading ? (
        <CustomerSkeleton />
      ) : customers.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Create the first customer before adding subscriptions. Customer records store contact details, billing address, and payment provider references."
            icon={Users}
            title="No customers yet"
          >
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create first customer
            </Button>
          </EmptyState>
        </div>
      ) : (
        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          {customers.map((customer) => {
            const address = formatCustomerAddress(customer);

            return (
              <article
                className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
                key={customer.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-[#102019]">
                        {customer.name}
                      </h2>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          customer.status === "active"
                            ? "bg-[#e5f4eb] text-[var(--brand-dark)]"
                            : "bg-[#f4ebe8] text-[#8f2a1f]"
                        }`}
                      >
                        {customer.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {customer.company_name ? (
                      <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                        {customer.company_name}
                      </p>
                    ) : null}
                  </div>
                  {customer.provider_customer_id ? (
                    <span className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                      {customer.provider_customer_id}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#102019]">
                  <p className="flex min-w-0 gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                    <span className="break-all">{customer.email}</span>
                  </p>
                  {customer.phone ? (
                    <p className="flex min-w-0 gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      <span>{customer.phone}</span>
                    </p>
                  ) : null}
                  {address ? (
                    <p className="flex min-w-0 gap-2 leading-6">
                      <Building2 className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      <span>{address}</span>
                    </p>
                  ) : null}
                </div>

                {customer.notes ? (
                  <p className="mt-4 rounded-md bg-[#f4fbf6] p-3 text-sm leading-6 text-[var(--muted)]">
                    {customer.notes}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[#102019] transition hover:bg-[#eef7f1] sm:w-auto"
                    href={`/customers/${customer.id}`}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    View detail
                  </Link>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() => openEditModal(customer)}
                    variant="secondary"
                  >
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() => handleArchive(customer)}
                    variant="danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Archive
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {isModalOpen ? (
        <CustomerFormModal
          key={selectedCustomer?.id ?? "create-customer"}
          customer={selectedCustomer}
          isOpen={isModalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}

function CustomerSkeleton() {
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

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
