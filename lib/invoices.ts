import { api } from "@/lib/api";
import type { ApiCollection, ApiResource } from "@/types/api";
import type { Invoice, InvoiceStatus } from "@/types/invoices";

export async function listInvoices() {
  const response = await api.get<ApiCollection<Invoice>>("/invoices");

  return response.data.data;
}

export async function getInvoice(invoiceId: number) {
  const response = await api.get<ApiResource<Invoice>>(`/invoices/${invoiceId}`);

  return response.data.data;
}

export function formatInvoiceAmount(
  invoice: Pick<Invoice, "amount_due" | "currency">,
) {
  return `${invoice.currency} ${invoice.amount_due}`;
}

export function formatLineItemAmount(
  lineItem: Pick<Invoice["line_items"][number], "amount_cents">,
) {
  return `ZAR ${(lineItem.amount_cents / 100).toFixed(2)}`;
}

export function invoiceStatusLabel(status: InvoiceStatus) {
  return status.replace("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

export function invoiceBalanceCents(invoice: Invoice) {
  return Math.max(invoice.amount_due_cents - invoice.amount_paid_cents, 0);
}
