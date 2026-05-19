import type { Customer } from "@/types/customers";
import type { Invoice } from "@/types/invoices";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type Payment = {
  id: number;
  account_id: number;
  invoice_id: number;
  customer_id: number;
  provider: string;
  provider_payment_id: string | null;
  amount_cents: number;
  amount: string;
  currency: "ZAR";
  status: PaymentStatus;
  failure_reason: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown>;
  customer?: Customer;
  invoice?: Invoice;
  created_at: string | null;
  updated_at: string | null;
};
