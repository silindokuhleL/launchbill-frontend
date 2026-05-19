import type { AccountSummary, AuthenticatedUser } from "@/types/auth";
import type { DashboardSummary } from "@/types/dashboard";

export type AdminAccessLevel =
  | "Platform admin"
  | "Account owner"
  | "Tenant admin"
  | "Limited access";

export type AdminReadinessStatus = "ready" | "watch" | "blocked";

export type AdminReadinessItem = {
  label: string;
  status: AdminReadinessStatus;
  detail: string;
};

export function adminAccessLevel({
  account,
  user,
}: {
  account: AccountSummary | null | undefined;
  user: AuthenticatedUser | null | undefined;
}): AdminAccessLevel {
  if (user?.global_roles.includes("super_admin")) {
    return "Platform admin";
  }

  if (account?.is_owner) {
    return "Account owner";
  }

  if (
    account?.permissions.includes("roles.manage") ||
    account?.permissions.includes("audit.view")
  ) {
    return "Tenant admin";
  }

  return "Limited access";
}

export function canAccessAdminPortal({
  account,
  user,
}: {
  account: AccountSummary | null | undefined;
  user: AuthenticatedUser | null | undefined;
}) {
  return adminAccessLevel({ account, user }) !== "Limited access";
}

export function adminExceptionCount(summary: DashboardSummary) {
  return summary.invoices.overdue + summary.payments.failed;
}

export function adminReadinessItems({
  account,
  aiWorkflowsComplete,
  summary,
}: {
  account: AccountSummary;
  aiWorkflowsComplete: number;
  summary: DashboardSummary;
}): AdminReadinessItem[] {
  const exceptions = adminExceptionCount(summary);

  return [
    {
      detail:
        exceptions > 0
          ? `${exceptions} billing exception${exceptions === 1 ? "" : "s"} need review.`
          : "No overdue invoices or failed payments are currently reported.",
      label: "Billing health",
      status: exceptions > 0 ? "watch" : "ready",
    },
    {
      detail:
        aiWorkflowsComplete >= 3
          ? "Billing summary, payment failure drafts, and admin insight are available."
          : "Finish the remaining AI workflow before relying on AI handoff notes.",
      label: "AI workflow coverage",
      status: aiWorkflowsComplete >= 3 ? "ready" : "watch",
    },
    {
      detail: account.permissions.includes("audit.view")
        ? "Audit visibility is enabled for this account."
        : "Add audit.view to the right admin role before production handoff.",
      label: "Audit readiness",
      status: account.permissions.includes("audit.view") ? "ready" : "blocked",
    },
    {
      detail: account.permissions.includes("roles.manage")
        ? "Role management is available for tenant administrators."
        : "Role management is not enabled for this account.",
      label: "Team and roles",
      status: account.permissions.includes("roles.manage") ? "ready" : "watch",
    },
    {
      detail: account.theme.primary_color
        ? `Tenant theme color is set to ${account.theme.primary_color}.`
        : "Add a primary brand color before presenting tenant branding.",
      label: "Theme settings",
      status: account.theme.primary_color ? "ready" : "watch",
    },
  ];
}
