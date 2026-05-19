"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Mail,
  Phone,
  ReceiptText,
  RefreshCcw,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  customerStatusLabel,
  formatCustomerAddress,
  getCustomer,
} from "@/lib/customers";
import {
  formatInvoiceAmount,
  invoiceBalanceCents,
  invoiceStatusLabel,
  listInvoices,
} from "@/lib/invoices";
import { formatPaymentAmount, listPayments, paymentStatusLabel } from "@/lib/payments";
import {
  formatSubscriptionAmount,
  listSubscriptions,
  statusLabel,
} from "@/lib/subscriptions";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import type { Customer } from "@/types/customers";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";
import type { Subscription } from "@/types/subscriptions";

type CustomerDetailClientProps = {
  customerId: number;
};

type CustomerBillingData = {
  invoices: Invoice[];
  payments: Payment[];
  subscriptions: Subscription[];
};

const customerStatusStyles = {
  active: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  inactive: "bg-[#f4ebe8] text-[#8f2a1f]",
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

const subscriptionStatusStyles = {
  active: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  trialing: "bg-[#e6f5ff] text-[#075985]",
  past_due: "bg-[#fff4df] text-[#8a4a00]",
  paused: "bg-[#edf1f5] text-[#344054]",
  canceled: "bg-[#f4ebe8] text-[#8f2a1f]",
};

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const auth = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [billingData, setBillingData] = useState<CustomerBillingData>({
    invoices: [],
    payments: [],
    subscriptions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canManageCustomers = Boolean(
    activeAccount?.permissions.includes("customers.manage"),
  );
  const canViewInvoices = Boolean(activeAccount?.permissions.includes("invoices.view"));
  const canViewPayments = Boolean(activeAccount?.permissions.includes("payments.view"));
  const canViewSubscriptions = Boolean(
    activeAccount?.permissions.includes("subscriptions.manage"),
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchCustomerDetail() {
      if (!auth.activeAccountId || !canManageCustomers || !Number.isFinite(customerId)) {
        if (isMounted) {
          setCustomer(null);
          setBillingData({ invoices: [], payments: [], subscriptions: [] });
          setIsLoading(false);
        }

        return;
      }

      try {
        const [nextCustomer, nextInvoices, nextPayments, nextSubscriptions] =
          await Promise.all([
            getCustomer(customerId),
            canViewInvoices ? listInvoices() : Promise.resolve([]),
            canViewPayments ? listPayments() : Promise.resolve([]),
            canViewSubscriptions ? listSubscriptions() : Promise.resolve([]),
          ]);

        if (isMounted) {
          setCustomer(nextCustomer);
          setBillingData({
            invoices: nextInvoices.filter((invoice) => invoice.customer_id === customerId),
            payments: nextPayments.filter((payment) => payment.customer_id === customerId),
            subscriptions: nextSubscriptions.filter(
              (subscription) => subscription.customer_id === customerId,
            ),
          });
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load customer detail."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchCustomerDetail();

    return () => {
      isMounted = false;
    };
  }, [
    auth.activeAccountId,
    canManageCustomers,
    canViewInvoices,
    canViewPayments,
    canViewSubscriptions,
    customerId,
    reloadKey,
  ]);

  const metrics = useMemo(() => {
    const outstandingCents = billingData.invoices.reduce(
      (total, invoice) => total + invoiceBalanceCents(invoice),
      0,
    );
    const paidCents = billingData.payments
      .filter((payment) => payment.status === "succeeded")
      .reduce((total, payment) => total + payment.amount_cents, 0);
    const activeSubscriptions = billingData.subscriptions.filter((subscription) =>
      ["active", "trialing"].includes(subscription.status),
    ).length;

    return [
      {
        icon: WalletCards,
        label: "Active subscriptions",
        value: String(activeSubscriptions),
      },
      {
        icon: FileText,
        label: "Open invoices",
        value: String(
          billingData.invoices.filter((invoice) =>
            ["open", "overdue"].includes(invoice.status),
          ).length,
        ),
      },
      {
        icon: ReceiptText,
        label: "Outstanding",
        value: `ZAR ${(outstandingCents / 100).toFixed(2)}`,
      },
      {
        icon: CreditCard,
        label: "Paid revenue",
        value: `ZAR ${(paidCents / 100).toFixed(2)}`,
      },
    ];
  }, [billingData.invoices, billingData.payments, billingData.subscriptions]);

  const address = customer ? formatCustomerAddress(customer) : "";

  return (
    <>
      <div className="mb-5">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-dark)] hover:text-[var(--brand)]"
          href="/customers"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to customers
        </Link>
      </div>

      <PageHeader
        eyebrow="Customer profile"
        title={customer?.name ?? "Customer detail"}
        description="Review contact details, billing health, subscriptions, invoices, and payments for one customer."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canManageCustomers ? (
          <Button onClick={() => setReloadKey((value) => value + 1)} variant="secondary">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert title="Customer detail needs attention" message={error} tone="error" />
      ) : null}

      {!canManageCustomers ? (
        <div className="mt-5">
          <EmptyState
            description="This account role cannot manage customer records. Customer detail access is controlled by the customers.manage permission."
            icon={UserRound}
            title="Customer access is restricted"
          />
        </div>
      ) : isLoading ? (
        <CustomerDetailSkeleton />
      ) : !customer ? (
        <div className="mt-5">
          <EmptyState
            description="The customer could not be found for this account."
            icon={UserRound}
            title="Customer not found"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6">
          <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-[#102019]">
                    {customer.name}
                  </h2>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                      customerStatusStyles[customer.status]
                    }`}
                  >
                    {customerStatusLabel(customer.status)}
                  </span>
                </div>
                {customer.company_name ? (
                  <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                    {customer.company_name}
                  </p>
                ) : null}
              </div>
              {customer.provider_customer_id ? (
                <span className="w-fit max-w-full break-all rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                  {customer.provider_customer_id}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-[#102019] md:grid-cols-2">
              <DetailLine icon={Mail} label="Email" value={customer.email} />
              <DetailLine icon={Phone} label="Phone" value={customer.phone ?? "Not set"} />
              <DetailLine
                icon={Building2}
                label="Billing address"
                value={address || "No billing address saved"}
              />
              <DetailLine
                icon={UserRound}
                label="Created"
                value={formatDate(customer.created_at) ?? "Not set"}
              />
            </div>

            {customer.notes ? (
              <div className="mt-5 rounded-md bg-[#f4fbf6] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-[#102019]">{customer.notes}</p>
              </div>
            ) : null}
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

          <RelatedSubscriptions subscriptions={billingData.subscriptions} />
          <RelatedInvoices invoices={billingData.invoices} />
          <RelatedPayments payments={billingData.payments} />
        </div>
      )}
    </>
  );
}

function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-md bg-[#f4fbf6] p-3">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-1 break-words font-semibold text-[#102019]">{value}</p>
      </div>
    </div>
  );
}

function RelatedSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <SectionHeading
        description="Plans currently connected to this customer."
        title="Subscriptions"
      />
      {subscriptions.length === 0 ? (
        <SmallEmpty icon={WalletCards} title="No subscriptions for this customer yet." />
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {subscriptions.map((subscription) => (
            <article className="rounded-md border border-[#d8e7dd] p-4" key={subscription.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#102019]">
                    {subscription.plan?.name ?? `Plan #${subscription.plan_id}`}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {formatSubscriptionAmount(subscription)}
                  </p>
                </div>
                <StatusBadge
                  className={subscriptionStatusStyles[subscription.status]}
                  label={statusLabel(subscription.status)}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <MiniMetric label="Quantity" value={String(subscription.quantity)} />
                <MiniMetric
                  label="Period ends"
                  value={formatDate(subscription.current_period_ends_at) ?? "Not set"}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <SectionHeading
        description="Recent billing documents and outstanding balances."
        title="Invoices"
      />
      {invoices.length === 0 ? (
        <SmallEmpty icon={FileText} title="No invoices for this customer yet." />
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
                <MiniMetric
                  label="Balance"
                  value={`ZAR ${(invoiceBalanceCents(invoice) / 100).toFixed(2)}`}
                />
                <MiniMetric label="Due" value={formatDate(invoice.due_at) ?? "Not set"} />
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
        description="Provider payment attempts tied to this customer."
        title="Payments"
      />
      {payments.length === 0 ? (
        <SmallEmpty icon={CreditCard} title="No payments for this customer yet." />
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
        Customer billing
      </p>
      <h2 className="mt-2 text-xl font-bold text-[#102019]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
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

function CustomerDetailSkeleton() {
  return (
    <div className="mt-5 grid gap-6">
      <div className="h-72 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
            key={item}
          />
        ))}
      </div>
      {[0, 1, 2].map((item) => (
        <div
          className="h-56 animate-pulse rounded-lg border border-[var(--border)] bg-[#e8f2ec]"
          key={item}
        />
      ))}
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

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
