import {
  BadgeCheck,
  Eye,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AccountSummary, AuthenticatedUser } from "@/types/auth";
import type { PermissionGroup, RoleDefinition } from "@/types/roles";

export const permissionGroups: PermissionGroup[] = [
  {
    name: "Dashboard",
    permissions: ["dashboard.view"],
  },
  {
    name: "Billing setup",
    permissions: ["plans.manage", "customers.manage", "subscriptions.manage"],
  },
  {
    name: "Billing records",
    permissions: ["invoices.view", "payments.view"],
  },
  {
    name: "Administration",
    permissions: ["team.manage", "roles.manage", "audit.view", "theme.manage"],
  },
  {
    name: "AI workflows",
    permissions: ["ai.billing_summary", "ai.payment_failure_draft"],
  },
];

export const roleDefinitions: RoleDefinition[] = [
  {
    description:
      "Full tenant control for billing setup, team access, theme settings, audit visibility, and AI workflows.",
    icon: ShieldCheck,
    label: "Account owner",
    name: "account_owner",
    permissions: [
      "dashboard.view",
      "plans.manage",
      "customers.manage",
      "subscriptions.manage",
      "invoices.view",
      "payments.view",
      "team.manage",
      "roles.manage",
      "audit.view",
      "theme.manage",
      "ai.billing_summary",
      "ai.payment_failure_draft",
    ],
  },
  {
    description:
      "Operational billing role for customers, subscriptions, invoices, payments, and AI payment follow-up.",
    icon: ReceiptText,
    label: "Billing manager",
    name: "billing_manager",
    permissions: [
      "dashboard.view",
      "customers.manage",
      "subscriptions.manage",
      "invoices.view",
      "payments.view",
      "ai.billing_summary",
      "ai.payment_failure_draft",
    ],
  },
  {
    description:
      "Read-focused access for dashboard, invoice, payment, and billing summary review.",
    icon: Eye,
    label: "Viewer",
    name: "viewer",
    permissions: [
      "dashboard.view",
      "invoices.view",
      "payments.view",
      "ai.billing_summary",
    ],
  },
  {
    description:
      "Global platform access. This role sits outside tenant scope and should stay separate from account roles.",
    icon: BadgeCheck,
    label: "Super admin",
    name: "super_admin",
    permissions: [
      "dashboard.view",
      "plans.manage",
      "customers.manage",
      "subscriptions.manage",
      "invoices.view",
      "payments.view",
      "team.manage",
      "roles.manage",
      "audit.view",
      "theme.manage",
      "ai.billing_summary",
      "ai.payment_failure_draft",
    ],
  },
];

export function canManageRoles({
  account,
  user,
}: {
  account: AccountSummary | null | undefined;
  user: AuthenticatedUser | null | undefined;
}) {
  return Boolean(
    user?.global_roles.includes("super_admin") ||
      account?.is_owner ||
      account?.permissions.includes("roles.manage"),
  );
}

export function activeRoleNames({
  account,
  user,
}: {
  account: AccountSummary | null | undefined;
  user: AuthenticatedUser | null | undefined;
}) {
  const tenantRoles = account?.roles ?? [];

  if (tenantRoles.length > 0) {
    return tenantRoles;
  }

  return user?.global_roles ?? [];
}

export function formatPermissionLabel(permission: string) {
  return permission
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .map((part) => part.replace(/^\w/, (letter) => letter.toUpperCase()))
    .join(" ");
}

export function roleCoveragePercentage(role: RoleDefinition, totalPermissions: number) {
  if (totalPermissions === 0) {
    return 0;
  }

  return Math.round((role.permissions.length / totalPermissions) * 100);
}

export function permissionIconForGroup(groupName: string): LucideIcon {
  const match = roleDefinitions.find((role) =>
    role.label.toLowerCase().includes(groupName.toLowerCase()),
  );

  return match?.icon ?? ShieldCheck;
}
