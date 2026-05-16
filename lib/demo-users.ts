import type { DemoUser } from "@/types/auth";

export const demoUsers: DemoUser[] = [
  {
    label: "Super Admin",
    email: "superadmin@launchbill.test",
    role: "Platform access",
  },
  {
    label: "Account Owner",
    email: "owner@launchbill.test",
    role: "Billing and team owner",
  },
  {
    label: "Billing Manager",
    email: "billing@launchbill.test",
    role: "Customers, invoices, payments",
  },
  {
    label: "Viewer",
    email: "viewer@launchbill.test",
    role: "Read-only dashboard",
  },
];
