import { describe, expect, it } from "vitest";
import {
  canManageTheme,
  defaultThemeColor,
  hasThemeChanges,
  isValidThemeColor,
  normalizeThemeColor,
  themePreviewFromAccount,
} from "@/lib/theme";
import type { AccountSummary, AuthenticatedUser } from "@/types/auth";

const account: AccountSummary = {
  billing_email: "billing@launchbill.test",
  id: 1,
  is_owner: false,
  name: "Acme LaunchBill Demo",
  permissions: ["dashboard.view", "theme.manage"],
  roles: ["account_owner"],
  status: "active",
  theme: {
    primary_color: "#0F6B3D",
  },
};

const user: AuthenticatedUser = {
  accounts: [account],
  email: "owner@launchbill.test",
  global_permissions: [],
  global_roles: [],
  id: 1,
  name: "LaunchBill Owner",
};

describe("theme helpers", () => {
  it("normalizes valid account colors", () => {
    expect(normalizeThemeColor("0F6B3D")).toBe("#0f6b3d");
    expect(normalizeThemeColor(" #0F766E ")).toBe("#0f766e");
  });

  it("falls back for invalid colors", () => {
    expect(normalizeThemeColor("green")).toBe(defaultThemeColor);
    expect(normalizeThemeColor(null)).toBe(defaultThemeColor);
  });

  it("validates full hex colors", () => {
    expect(isValidThemeColor("#0f6b3d")).toBe(true);
    expect(isValidThemeColor("#fff")).toBe(false);
    expect(isValidThemeColor("0f6b3d")).toBe(false);
  });

  it("allows theme management for owner, theme manager, or super admin", () => {
    expect(canManageTheme({ account, user })).toBe(true);
    expect(
      canManageTheme({
        account: {
          ...account,
          is_owner: true,
          permissions: ["dashboard.view"],
        },
        user,
      }),
    ).toBe(true);
    expect(
      canManageTheme({
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

  it("blocks theme management for read-only users", () => {
    expect(
      canManageTheme({
        account: {
          ...account,
          is_owner: false,
          permissions: ["dashboard.view"],
        },
        user,
      }),
    ).toBe(false);
  });

  it("creates a preview from the selected account", () => {
    expect(themePreviewFromAccount(account)).toEqual({
      brandName: "Acme LaunchBill Demo",
      primaryColor: "#0f6b3d",
    });
  });

  it("detects meaningful theme changes", () => {
    expect(
      hasThemeChanges(
        { brandName: "Acme", primaryColor: "#0f766e" },
        { brandName: "Acme", primaryColor: "#0f6b3d" },
      ),
    ).toBe(true);
    expect(
      hasThemeChanges(
        { brandName: "Acme", primaryColor: "#0F6B3D" },
        { brandName: "Acme", primaryColor: "#0f6b3d" },
      ),
    ).toBe(false);
  });
});
