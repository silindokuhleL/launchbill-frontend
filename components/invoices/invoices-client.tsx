"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Eye, FileText, ReceiptText } from "lucide-react";
import {
  formatInvoiceAmount,
  getInvoice,
  invoiceBalanceCents,
  invoiceStatusLabel,
  listInvoices,
} from "@/lib/invoices";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceDetailModal } from "@/components/invoices/invoice-detail-modal";
import type { Invoice, InvoiceStatus } from "@/types/invoices";

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-[#edf1f5] text-[#344054]",
  open: "bg-[#e6f5ff] text-[#075985]",
  overdue: "bg-[#fff4df] text-[#8a4a00]",
  paid: "bg-[#e5f4eb] text-[var(--brand-dark)]",
  void: "bg-[#f4ebe8] text-[#8f2a1f]",
};

export function InvoicesClient() {
  const auth = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const canViewInvoices = Boolean(
    activeAccount?.permissions.includes("invoices.view"),
  );

  const loadInvoices = useCallback(async () => {
    if (!auth.activeAccountId || !canViewInvoices) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setInvoices(await listInvoices());
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load invoices."));
    } finally {
      setIsLoading(false);
    }
  }, [auth.activeAccountId, canViewInvoices]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialInvoices() {
      if (!auth.activeAccountId || !canViewInvoices) {
        if (isMounted) {
          setInvoices([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const nextInvoices = await listInvoices();

        if (isMounted) {
          setInvoices(nextInvoices);
          setError(null);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(errorMessage(caughtError, "Could not load invoices."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialInvoices();

    return () => {
      isMounted = false;
    };
  }, [auth.activeAccountId, canViewInvoices]);

  async function openInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setIsDetailLoading(true);
    setError(null);

    try {
      setSelectedInvoice(await getInvoice(invoice.id));
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Could not load invoice details."));
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Billing documents"
        title="Invoices"
        description="Review issued invoices, payment status, due dates, and customer billing context."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
          {activeAccount?.name ?? "No account selected"}
        </div>
        {canViewInvoices ? (
          <Button onClick={loadInvoices} variant="secondary">
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4" aria-live="polite">
        {error ? (
          <Alert title="Invoices need attention" message={error} tone="error" />
        ) : null}
      </div>

      {!canViewInvoices ? (
        <div className="mt-5">
          <EmptyState
            description="This account role cannot view invoice records. Invoice visibility is controlled by the invoices.view permission."
            icon={FileText}
            title="Invoice access is restricted"
          />
        </div>
      ) : isLoading ? (
        <InvoiceSkeleton />
      ) : invoices.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Invoices will appear here once billing cycles or payment webhooks create them."
            icon={FileText}
            title="No invoices yet"
          />
        </div>
      ) : (
        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          {invoices.map((invoice) => {
            const balance = invoiceBalanceCents(invoice);

            return (
              <article
                className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
                key={invoice.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-[#102019]">
                        {invoice.number}
                      </h2>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          statusStyles[invoice.status]
                        }`}
                      >
                        {invoiceStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                      {invoice.customer?.name ?? `Customer #${invoice.customer_id}`}
                    </p>
                  </div>
                  {invoice.provider_invoice_id ? (
                    <span className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-bold text-[#365548]">
                      {invoice.provider_invoice_id}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#102019] sm:grid-cols-2">
                  <InvoiceMetric label="Amount due" value={formatInvoiceAmount(invoice)} />
                  <InvoiceMetric
                    label="Balance"
                    value={`ZAR ${(balance / 100).toFixed(2)}`}
                  />
                  <InvoiceMetric
                    label="Issued"
                    value={formatDate(invoice.issued_at) ?? "Not issued"}
                  />
                  <InvoiceMetric
                    label="Due"
                    value={formatDate(invoice.due_at) ?? "No due date"}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isDetailLoading}
                    onClick={() => openInvoice(invoice)}
                    variant="secondary"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    View details
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedInvoice ? (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isLoading={isDetailLoading}
          onClose={() => setSelectedInvoice(null)}
        />
      ) : null}
    </>
  );
}

function InvoiceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f4fbf6] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#102019]">{value}</p>
    </div>
  );
}

function InvoiceSkeleton() {
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
