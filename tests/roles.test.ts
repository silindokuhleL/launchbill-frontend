import { describe, expect, it } from "vitest";
import {
  activeRoleNames,
  canManageRoles,
  formatPermissionLabel,
  permissionGroups,
  roleCoveragePercentage,
  roleDefinitions,
} from "@/lib/roles";
import type { AccountSummary, AuthenticatedUser } from "@/types/auth";

const account: AccountSummary = {
  billing_email: "billing@launchbill.test",
  id: 1,
  is_owner: false,
  name: "Acme LaunchBill Demo",
  permissions: ["dashboard.view", "roles.manage"],
  roles: ["billing_manager"],
  status: "active",
  theme: {
    primary_color: "#0f6b3d",
  },
};

const user: AuthenticatedUser = {
  accounts: [account],
  email: "billing@launchbill.test",
  global_permissions: [],
  global_roles: [],
  id: 1,
  name: "LaunchBill Billing Manager",
};

describe("role management helpers", () => {
  it("allows role management for owners, role managers, and super admins", () => {
    expect(canManageRoles({ account, user })).toBe(true);
    expect(
      canManageRoles({
        account: {
          ...account,
          is_owner: true,
          permissions: ["dashboard.view"],
        },
        user,
      }),
    ).toBe(true);
    expect(
      canManageRoles({
        account: {
          ...account,
          permissions: ["dashboard.view"],
        },
        user: {
          ...user,
          global_roles: ["super_admin"],
        },
      }),
    ).toBe(true);
  });

  it("blocks role management for read-only account users", () => {
    expect(
      canManageRoles({
        account: {
          ...account,
          is_owner: false,
          permissions: ["dashboard.view"],
          roles: ["viewer"],
        },
        user,
      }),
    ).toBe(false);
  });

  it("uses tenant roles before global roles", () => {
    expect(
      activeRoleNames({
        account,
        user: {
          ...user,
          global_roles: ["super_admin"],
        },
      }),
    ).toEqual(["billing_manager"]);
  });

  it("falls back to global roles when no tenant role exists", () => {
    expect(
      activeRoleNames({
        account: {
          ...account,
          roles: [],
        },
        user: {
          ...user,
          global_roles: ["super_admin"],
        },
      }),
    ).toEqual(["super_admin"]);
  });

  it("formats permission labels for display", () => {
    expect(formatPermissionLabel("ai.payment_failure_draft")).toBe(
      "Ai Payment failure draft",
    );
  });

  it("calculates role permission coverage", () => {
    const totalPermissions = permissionGroups.reduce(
      (total, group) => total + group.permissions.length,
      0,
    );
    const owner = roleDefinitions.find((role) => role.name === "account_owner");
    const viewer = roleDefinitions.find((role) => role.name === "viewer");

    expect(owner ? roleCoveragePercentage(owner, totalPermissions) : 0).toBe(100);
    expect(viewer ? roleCoveragePercentage(viewer, totalPermissions) : 0).toBe(33);
  });
});
