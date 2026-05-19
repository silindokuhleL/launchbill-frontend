import { describe, expect, it } from "vitest";
import {
  adminAccessLevel,
  adminExceptionCount,
  adminReadinessItems,
  canAccessAdminPortal,
} from "@/lib/admin";
import type { AccountSummary, AuthenticatedUser } from "@/types/auth";
import type { DashboardSummary } from "@/types/dashboard";

const account: AccountSummary = {
  billing_email: "billing@launchbill.test",
  id: 1,
  is_owner: false,
  name: "Acme LaunchBill Demo",
  permissions: ["audit.view", "roles.manage"],
  roles: ["admin"],
  status: "active",
  theme: {
    primary_color: "#0f6b3d",
  },
};

const user: AuthenticatedUser = {
  accounts: [account],
  email: "admin@launchbill.test",
  global_permissions: [],
  global_roles: [],
  id: 1,
  name: "LaunchBill Admin",
};

const summary: DashboardSummary = {
  account: {
    billing_email: "billing@launchbill.test",
    id: 1,
    name: "Acme LaunchBill Demo",
  },
  customers: {
    active: 2,
    inactive: 0,
    total: 2,
  },
  invoices: {
    draft: 0,
    open: 1,
    overdue: 2,
    paid: 3,
    total: 6,
    void: 0,
  },
  payments: {
    failed: 1,
    pending: 1,
    refunded: 0,
    succeeded: 4,
    total: 6,
  },
  plans: {
    active: 2,
    archived: 0,
    total: 2,
  },
  revenue: {
    active_mrr: "498.00",
    active_mrr_cents: 49800,
    currency: "ZAR",
    failed_revenue: "99.00",
    failed_revenue_cents: 9900,
    outstanding_invoice: "898.00",
    outstanding_invoice_cents: 89800,
    pending_revenue: "799.00",
    pending_revenue_cents: 79900,
    total_revenue: "1494.00",
    total_revenue_cents: 149400,
  },
  subscriptions: {
    active: 2,
    canceled: 0,
    past_due: 1,
    paused: 0,
    total: 4,
    trialing: 1,
  },
};

describe("admin portal helpers", () => {
  it("identifies the strongest admin access level", () => {
    expect(
      adminAccessLevel({
        account,
        user: {
          ...user,
          global_roles: ["super_admin"],
        },
      }),
    ).toBe("Platform admin");

    expect(
      adminAccessLevel({
        account: {
          ...account,
          is_owner: true,
        },
        user,
      }),
    ).toBe("Account owner");

    expect(adminAccessLevel({ account, user })).toBe("Tenant admin");
  });

  it("blocks users without owner, role, or audit permissions", () => {
    const limitedAccount = {
      ...account,
      is_owner: false,
      permissions: ["dashboard.view"],
      roles: ["viewer"],
    };

    expect(
      canAccessAdminPortal({
        account: limitedAccount,
        user: {
          ...user,
          global_roles: [],
        },
      }),
    ).toBe(false);
  });

  it("counts billing exceptions for admin follow-up", () => {
    expect(adminExceptionCount(summary)).toBe(3);
  });

  it("builds readiness items from account and dashboard context", () => {
    const items = adminReadinessItems({
      account,
      aiWorkflowsComplete: 3,
      summary,
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Billing health",
          status: "watch",
        }),
        expect.objectContaining({
          label: "Audit readiness",
          status: "ready",
        }),
      ]),
    );
  });
});
