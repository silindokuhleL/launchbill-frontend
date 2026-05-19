import {
  BarChart3,
  Bot,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Revenue, churn, and account health will live here.",
    icon: LayoutDashboard,
  },
  {
    href: "/plans",
    label: "Plans",
    description: "Create and manage pricing plans before connecting PayFast.",
    icon: ListChecks,
  },
  {
    href: "/customers",
    label: "Customers",
    description: "Customer records, tenant ownership, and billing status.",
    icon: Users,
  },
  {
    href: "/subscriptions",
    label: "Subscriptions",
    description: "Lifecycle tracking for trialing, active, paused, and cancelled subscriptions.",
    icon: BarChart3,
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Invoice history and payment state once billing is added.",
    icon: FileText,
  },
  {
    href: "/payments",
    label: "Payments",
    description: "PayFast transactions, failures, and reconciliation.",
    icon: CreditCard,
  },
  {
    href: "/team",
    label: "Team",
    description: "Invite users and manage tenant roles.",
    icon: ShieldCheck,
  },
  {
    href: "/audit",
    label: "Audit",
    description: "Request, auth, tenant, billing, and AI audit history.",
    icon: Receipt,
  },
  {
    href: "/ai",
    label: "AI Assist",
    description: "Billing summaries and payment failure drafts.",
    icon: Bot,
  },
  {
    href: "/admin",
    label: "Admin",
    description: "Account access, billing readiness, and admin next steps.",
    icon: LockKeyhole,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Theme, account, notification, and integration settings.",
    icon: Settings,
  },
];

export function findNavigationItem(pathname: string): NavigationItem {
  return (
    navigationItems.find((item) => pathname.startsWith(item.href)) ??
    navigationItems[0]
  );
}
