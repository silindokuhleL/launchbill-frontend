export type DashboardSummary = {
  account: {
    id: number;
    name: string;
    billing_email: string | null;
  };
  revenue: {
    currency: "ZAR";
    total_revenue_cents: number;
    total_revenue: string;
    pending_revenue_cents: number;
    pending_revenue: string;
    failed_revenue_cents: number;
    failed_revenue: string;
    outstanding_invoice_cents: number;
    outstanding_invoice: string;
    active_mrr_cents: number;
    active_mrr: string;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
  plans: {
    total: number;
    active: number;
    archived: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    paused: number;
    past_due: number;
    canceled: number;
  };
  invoices: {
    total: number;
    paid: number;
    open: number;
    overdue: number;
    draft: number;
    void: number;
  };
  payments: {
    total: number;
    succeeded: number;
    pending: number;
    failed: number;
    refunded: number;
  };
};
