import type { Customer } from "@/types/customers";
import type { Subscription } from "@/types/subscriptions";

export type InvoiceStatus = "draft" | "open" | "paid" | "overdue" | "void";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_price_cents: number;
  amount_cents: number;
};

export type Invoice = {
  id: number;
  account_id: number;
  customer_id: number;
  subscription_id: number | null;
  provider_invoice_id: string | null;
  number: string;
  amount_due_cents: number;
  amount_due: string;
  amount_paid_cents: number;
  amount_paid: string;
  currency: "ZAR";
  status: InvoiceStatus;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  line_items: InvoiceLineItem[];
  metadata: Record<string, unknown>;
  customer?: Customer;
  subscription?: Subscription;
  created_at: string | null;
  updated_at: string | null;
};
