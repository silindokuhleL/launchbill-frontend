import type { AccountSummary, AuthenticatedUser } from "@/types/auth";
import type { ThemePreset, ThemePreview } from "@/types/theme";

export const defaultThemeColor = "#0f6b3d";

export const themePresets: ThemePreset[] = [
  {
    description: "Current LaunchBill product green.",
    name: "Launch green",
    primaryColor: "#0f6b3d",
  },
  {
    description: "A deeper enterprise green for stronger contrast.",
    name: "Executive forest",
    primaryColor: "#074d32",
  },
  {
    description: "A calm blue-green for service businesses.",
    name: "Service teal",
    primaryColor: "#0f766e",
  },
  {
    description: "A warm gold accent for premium plans.",
    name: "Premium gold",
    primaryColor: "#a8792a",
  },
];

export function canManageTheme({
  account,
  user,
}: {
  account: AccountSummary | null | undefined;
  user: AuthenticatedUser | null | undefined;
}) {
  return Boolean(
    user?.global_roles.includes("super_admin") ||
      account?.is_owner ||
      account?.permissions.includes("theme.manage"),
  );
}

export function normalizeThemeColor(value: string | null | undefined) {
  if (!value) {
    return defaultThemeColor;
  }

  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (!isValidThemeColor(withHash)) {
    return defaultThemeColor;
  }

  return withHash.toLowerCase();
}

export function isValidThemeColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function themePreviewFromAccount(
  account: AccountSummary | null | undefined,
): ThemePreview {
  return {
    brandName: account?.name ?? "LaunchBill Account",
    primaryColor: normalizeThemeColor(account?.theme.primary_color),
  };
}

export function hasThemeChanges(current: ThemePreview, initial: ThemePreview) {
  return (
    current.brandName.trim() !== initial.brandName.trim() ||
    normalizeThemeColor(current.primaryColor) !== normalizeThemeColor(initial.primaryColor)
  );
}
