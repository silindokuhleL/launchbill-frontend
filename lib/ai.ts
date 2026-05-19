import { dashboardHealthLabel } from "@/lib/dashboard";
import { invoiceBalanceCents } from "@/lib/invoices";
import type {
  AdminActivityInsight,
  BillingSummaryDraft,
  PaymentFailureDraft,
} from "@/types/ai";
import type { AccountSummary, AuthenticatedUser } from "@/types/auth";
import type { DashboardSummary } from "@/types/dashboard";
import type { Invoice } from "@/types/invoices";
import type { Payment } from "@/types/payments";

type BillingSummaryInput = {
  invoices: Invoice[];
  payments: Payment[];
  summary: DashboardSummary;
};

type AdminActivityInsightInput = {
  account: AccountSummary;
  invoices: Invoice[];
  payments: Payment[];
  summary: DashboardSummary;
  user: AuthenticatedUser;
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

export function generatePaymentFailureDraft(payment: Payment): PaymentFailureDraft {
  const customerName = payment.customer?.name ?? "there";
  const invoiceLabel = payment.invoice?.number ?? `invoice #${payment.invoice_id}`;
  const amount = `${payment.currency} ${payment.amount}`;
  const failureReason = payment.failure_reason ?? "the payment could not be completed";

  return {
    subject: `Payment follow-up for ${invoiceLabel}`,
    body: [
      `Hi ${customerName},`,
      "",
      `We noticed that the recent ${amount} payment for ${invoiceLabel} did not go through. The provider message was: ${failureReason}.`,
      "",
      "Could you please retry the payment or let us know if you need the billing details resent?",
      "",
      "Thank you,",
      "LaunchBill Billing Team",
    ].join("\n"),
    nextActions: [
      "Confirm the invoice and payment details before sending.",
      "Check whether the customer already retried the payment.",
      "Edit the message tone before using it with the customer.",
    ],
  };
}

export function paymentFailureDraftToEditableText(draft: PaymentFailureDraft) {
  return [`Subject: ${draft.subject}`, "", draft.body].join("\n");
}

export function generateAdminActivityInsight({
  account,
  invoices,
  payments,
  summary,
  user,
}: AdminActivityInsightInput): AdminActivityInsight {
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");
  const failedPayments = payments.filter((payment) => payment.status === "failed");
  const riskLevel = getBillingRiskLevel(summary);
  const roleLabel = account.roles.length
    ? account.roles.join(", ")
    : user.global_roles.join(", ") || "No role assigned";
  const permissionCount =
    account.permissions.length || user.global_permissions.length;

  return {
    title:
      riskLevel === "attention"
        ? "Admin attention recommended"
        : "Admin activity is stable",
    riskLevel,
    narrative: [
      `${account.name} is ${account.status} and your current access is ${roleLabel}.`,
      `This account exposes ${permissionCount} permissions for the active session, with ${summary.customers.total} customers, ${summary.subscriptions.total} subscriptions, and ${summary.invoices.total} invoices in scope.`,
      `Current operational pressure: ${countLabel(overdueInvoices.length, "overdue invoice")} and ${countLabel(failedPayments.length, "failed payment")}.`,
    ].join(" "),
    nextActions: buildAdminActions({
      account,
      failedPaymentCount: failedPayments.length,
      overdueInvoiceCount: overdueInvoices.length,
      summary,
      user,
    }),
  };
}

export function adminActivityInsightToEditableText(insight: AdminActivityInsight) {
  return [
    insight.title,
    "",
    insight.narrative,
    "",
    "Recommended admin actions:",
    ...insight.nextActions.map((action, index) => `${index + 1}. ${action}`),
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

function buildAdminActions({
  account,
  failedPaymentCount,
  overdueInvoiceCount,
  summary,
  user,
}: {
  account: AccountSummary;
  failedPaymentCount: number;
  overdueInvoiceCount: number;
  summary: DashboardSummary;
  user: AuthenticatedUser;
}) {
  const actions: string[] = [];

  if (!account.is_owner && !user.global_roles.includes("super_admin")) {
    actions.push("Confirm whether this user needs owner-level access before changing roles.");
  }

  if (failedPaymentCount > 0 || overdueInvoiceCount > 0) {
    actions.push("Review billing exceptions before changing account configuration.");
  }

  if (summary.subscriptions.paused > 0) {
    actions.push(
      `Check ${countLabel(summary.subscriptions.paused, "paused subscription")} for admin or billing follow-up.`,
    );
  }

  if (account.permissions.length === 0 && user.global_permissions.length === 0) {
    actions.push("Review permission seeding because no permissions are visible in this session.");
  }

  if (actions.length === 0) {
    actions.push("Keep monitoring admin activity and audit readiness during each release.");
  }

  return actions;
}

function countLabel(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
