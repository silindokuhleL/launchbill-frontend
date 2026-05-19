import { api } from "@/lib/api";
import type { ApiCollection, ApiResource } from "@/types/api";
import type { Payment, PaymentStatus } from "@/types/payments";

export async function listPayments() {
  const response = await api.get<ApiCollection<Payment>>("/payments");

  return response.data.data;
}

export async function getPayment(paymentId: number) {
  const response = await api.get<ApiResource<Payment>>(`/payments/${paymentId}`);

  return response.data.data;
}

export function formatPaymentAmount(payment: Pick<Payment, "amount" | "currency">) {
  return `${payment.currency} ${payment.amount}`;
}

export function paymentStatusLabel(status: PaymentStatus) {
  return status.replace("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

export function paymentTimelineLabel(payment: Payment) {
  if (payment.status === "succeeded" && payment.paid_at) {
    return `Paid ${formatDate(payment.paid_at)}`;
  }

  if (payment.status === "failed" && payment.failed_at) {
    return `Failed ${formatDate(payment.failed_at)}`;
  }

  if (payment.status === "refunded" && payment.refunded_at) {
    return `Refunded ${formatDate(payment.refunded_at)}`;
  }

  return "Awaiting provider update";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
  }).format(new Date(value));
}
