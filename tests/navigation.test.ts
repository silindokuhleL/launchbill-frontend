import { describe, expect, it } from "vitest";
import { findNavigationItem, navigationItems } from "@/lib/navigation";

describe("navigationItems", () => {
  it("includes the protected module placeholders", () => {
    expect(navigationItems.map((item) => item.href)).toEqual([
      "/dashboard",
      "/plans",
      "/customers",
      "/subscriptions",
      "/invoices",
      "/payments",
      "/team",
      "/audit",
      "/ai",
      "/admin",
      "/settings",
    ]);
  });

  it("finds the active navigation item for nested paths", () => {
    expect(findNavigationItem("/payments/123").label).toBe("Payments");
  });
});
