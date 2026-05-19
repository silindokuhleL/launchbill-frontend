import { dashboardHealthLabel } from "@/lib/dashboard";
import { invoiceBalanceCents } from "@/lib/invoices";
import type { BillingSummaryDraft } from "@/types/ai";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";

type BillingSummaryInput = {
  invoices: Invoice[];
  payments: Payment[];
  summary: DashboardSummary;
};

export function generateBillingSummaryDraft({
  invoices,
  payments,
  summary,
}: BillingSummaryInput): BillingSummaryDraft {
  const failedPayments = payments.filter((payment) => payment.status === "failed");
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");
  const openInvoices = invoices.filter((invoice) => invoice.status === "open");
  const outstandingCents = invoices.reduce(
    (total, invoice) => total + invoiceBalanceCents(invoice),
    0,
  );
  const riskLevel = getBillingRiskLevel(summary);
  const nextActions = buildNextActions({
    failedPayments,
    openInvoices,
    overdueInvoices,
    summary,
  });

  return {
    title: dashboardHealthLabel(summary),
    riskLevel,
    narrative: [
      `${summary.account.name} has ${countLabel(summary.customers.active, "active customer")} and ${countLabel(summary.subscriptions.active, "active subscription")}.`,
      `Succeeded revenue is ${summary.revenue.currency} ${summary.revenue.total_revenue}, active MRR is ${summary.revenue.currency} ${summary.revenue.active_mrr}, and outstanding invoice balance is ${summary.revenue.currency} ${(outstandingCents / 100).toFixed(2)}.`,
      `${countLabel(summary.invoices.open, "invoice")} ${summary.invoices.open === 1 ? "is" : "are"} open, ${summary.invoices.overdue} ${summary.invoices.overdue === 1 ? "is" : "are"} overdue, and ${summary.payments.failed} ${summary.payments.failed === 1 ? "payment has" : "payments have"} failed.`,
    ].join(" "),
    nextActions,
  };
}

export function billingSummaryToEditableText(draft: BillingSummaryDraft) {
  return [
    draft.title,
    "",
    draft.narrative,
    "",
    "Recommended next actions:",
    ...draft.nextActions.map((action, index) => `${index + 1}. ${action}`),
  ].join("\n");
}

function getBillingRiskLevel(summary: DashboardSummary) {
  if (summary.invoices.overdue > 0 || summary.payments.failed > 0) {
    return "attention";
  }

  if (summary.invoices.open > 0 || summary.payments.pending > 0) {
    return "watch";
  }

  return "healthy";
}

function buildNextActions({
  failedPayments,
  openInvoices,
  overdueInvoices,
  summary,
}: {
  failedPayments: Payment[];
  openInvoices: Invoice[];
  overdueInvoices: Invoice[];
  summary: DashboardSummary;
}) {
  const actions: string[] = [];

  if (failedPayments.length > 0) {
    actions.push(
      `Review ${failedPayments.length} failed payment ${failedPayments.length === 1 ? "attempt" : "attempts"} and prepare customer follow-up messages.`,
    );
  }

  if (overdueInvoices.length > 0) {
    actions.push(
      `Prioritize ${overdueInvoices.length} overdue ${overdueInvoices.length === 1 ? "invoice" : "invoices"} before the next billing run.`,
    );
  }

  if (openInvoices.length > 0) {
    actions.push(
      `Monitor ${openInvoices.length} open ${openInvoices.length === 1 ? "invoice" : "invoices"} and confirm expected payment dates.`,
    );
  }

  if (summary.subscriptions.trialing > 0) {
    actions.push(
      `Check ${summary.subscriptions.trialing} trialing ${summary.subscriptions.trialing === 1 ? "subscription" : "subscriptions"} for conversion readiness.`,
    );
  }

  if (actions.length === 0) {
    actions.push("Keep monitoring billing health and prepare the next revenue review.");
  }

  return actions;
}

function countLabel(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
