"use client";

import { useMemo, useState } from "react";
import {
  Brush,
  CheckCircle2,
  ImagePlus,
  LockKeyhole,
  Palette,
  RefreshCcw,
  Save,
} from "lucide-react";
import {
  canManageTheme,
  hasThemeChanges,
  isValidThemeColor,
  normalizeThemeColor,
  themePresets,
  themePreviewFromAccount,
} from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import type { ThemePreview } from "@/types/theme";

export function ThemeCustomizationClient() {
  const auth = useAuth();
  const [draftState, setDraftState] = useState<{
    accountId: number | null;
    appliedPreview: ThemePreview | null;
    notice: string | null;
    preview: ThemePreview;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const initialPreview = useMemo(
    () => themePreviewFromAccount(activeAccount),
    [activeAccount],
  );
  const canManage = canManageTheme({
    account: activeAccount,
    user: auth.user,
  });
  const activeAccountId = activeAccount?.id ?? null;
  const draftMatchesAccount = draftState?.accountId === activeAccountId;
  const preview = draftMatchesAccount ? draftState.preview : initialPreview;
  const appliedPreview = draftMatchesAccount ? draftState.appliedPreview : null;
  const notice = draftMatchesAccount ? draftState.notice : null;
  const colorIsValid = isValidThemeColor(preview.primaryColor);
  const hasChanges = hasThemeChanges(preview, appliedPreview ?? initialPreview);

  function updatePreview(updater: (current: ThemePreview) => ThemePreview) {
    setDraftState((current) => {
      const currentPreview =
        current?.accountId === activeAccountId ? current.preview : initialPreview;

      return {
        accountId: activeAccountId,
        appliedPreview:
          current?.accountId === activeAccountId ? current.appliedPreview : null,
        notice: current?.accountId === activeAccountId ? current.notice : null,
        preview: updater(currentPreview),
      };
    });
  }

  async function handleApplyPreview() {
    if (!canManage || !colorIsValid || !hasChanges) {
      return;
    }

    setIsApplying(true);
    setDraftState({
      accountId: activeAccountId,
      appliedPreview,
      notice: null,
      preview,
    });

    await new Promise((resolve) => window.setTimeout(resolve, 300));

    const nextPreview = {
      brandName: preview.brandName.trim() || initialPreview.brandName,
      primaryColor: normalizeThemeColor(preview.primaryColor),
    };

    setDraftState({
      accountId: activeAccountId,
      appliedPreview: nextPreview,
      notice:
        "Theme preview applied locally. API persistence will be enabled when /theme is ready.",
      preview: nextPreview,
    });
    setIsApplying(false);
  }

  function handleReset() {
    setDraftState({
      accountId: activeAccountId,
      appliedPreview: null,
      notice: "Theme preview reset to the selected account values.",
      preview: initialPreview,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Account settings"
        title="Theme Customization"
        description="Preview tenant branding, choose a primary color, and prepare the account theme before the backend theme endpoint is connected."
      />

      <div className="grid gap-5">
        <section className="rounded-lg border border-[#b7d8c3] bg-[#f4fbf6] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--brand-dark)]">
                {activeAccount?.name ?? "No account selected"}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Current API color: {initialPreview.primaryColor}. Logo upload is prepared
                for the future media endpoint.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleReset} variant="secondary">
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
              <Button
                disabled={!canManage || !colorIsValid || !hasChanges}
                isLoading={isApplying}
                onClick={handleApplyPreview}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Apply preview
              </Button>
            </div>
          </div>
        </section>

        {!canManage ? (
          <EmptyState
            description="Theme changes require owner, theme.manage, or super admin access. You can still inspect the current account branding."
            icon={LockKeyhole}
            title="Theme editing is restricted"
          />
        ) : (
          <Alert
            message="The backend contract already lists GET /theme, PATCH /theme, and POST /theme/logo. This screen keeps the UI ready while those endpoints are completed."
            title="Theme API pending"
            tone="info"
          />
        )}

        {notice ? (
          <Alert title="Theme preview updated" message={notice} tone="success" />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
                <Palette className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Brand controls
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#102019]">
                  Account theme details
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-5">
              <label className="block">
                <span className="text-sm font-bold text-[#102019]">Brand name</span>
                <input
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc] disabled:bg-[#f2f4f3]"
                  disabled={!canManage}
                  onChange={(event) =>
                    updatePreview((current) => ({
                      ...current,
                      brandName: event.target.value,
                    }))
                  }
                  value={preview.brandName}
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#102019]">Primary color</span>
                <div className="mt-2 grid gap-3 sm:grid-cols-[72px_1fr]">
                  <input
                    aria-label="Primary color picker"
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-white p-1 disabled:opacity-60"
                    disabled={!canManage}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        primaryColor: event.target.value,
                      }))
                    }
                    type="color"
                    value={colorIsValid ? preview.primaryColor : "#0f6b3d"}
                  />
                  <input
                    className="min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc] disabled:bg-[#f2f4f3]"
                    disabled={!canManage}
                    onChange={(event) =>
                      updatePreview((current) => ({
                        ...current,
                        primaryColor: event.target.value,
                      }))
                    }
                    value={preview.primaryColor}
                  />
                </div>
                {!colorIsValid ? (
                  <p className="mt-2 text-sm font-semibold text-[#9b1c12]">
                    Use a full hex color like #0f6b3d.
                  </p>
                ) : null}
              </label>

              <div>
                <p className="text-sm font-bold text-[#102019]">Presets</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {themePresets.map((preset) => (
                    <button
                      className="rounded-md border border-[#d8e7dd] bg-[#fbfefd] p-3 text-left transition hover:border-[#9ed4af] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canManage}
                      key={preset.name}
                      onClick={() =>
                        updatePreview((current) => ({
                          ...current,
                          primaryColor: preset.primaryColor,
                        }))
                      }
                      type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-md border border-black/10"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span>
                          <span className="block text-sm font-bold text-[#102019]">
                            {preset.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                            {preset.description}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-dashed border-[#b7d8c3] bg-[#fbfefd] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
                      <ImagePlus className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold text-[#102019]">Logo upload</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        Ready for POST /theme/logo when media upload is enabled.
                      </p>
                    </div>
                  </div>
                  <Button disabled variant="secondary">
                    Upload later
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ThemePreviewPanel preview={preview} colorIsValid={colorIsValid} />
        </section>
      </div>
    </>
  );
}

function ThemePreviewPanel({
  colorIsValid,
  preview,
}: {
  colorIsValid: boolean;
  preview: ThemePreview;
}) {
  const color = colorIsValid ? normalizeThemeColor(preview.primaryColor) : "#0f6b3d";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
          <Brush className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Live preview
          </p>
          <h2 className="mt-2 text-xl font-bold text-[#102019]">
            Branded tenant surface
          </h2>
        </div>
      </div>

      <div
        className="mt-5 overflow-hidden rounded-lg border border-[#d8e7dd]"
        style={{ ["--preview-brand" as string]: color }}
      >
        <div className="bg-[var(--preview-brand)] p-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15 text-lg font-bold">
                {preview.brandName.trim().slice(0, 1).toUpperCase() || "L"}
              </div>
              <div>
                <p className="font-bold">{preview.brandName || "LaunchBill Account"}</p>
                <p className="text-sm text-white/80">Billing workspace</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              Active
            </span>
          </div>
        </div>

        <div className="grid gap-4 bg-[#fbfefd] p-5 sm:grid-cols-2">
          <PreviewCard label="Open invoices" value="12" color={color} />
          <PreviewCard label="Active customers" value="48" color={color} />
          <div className="rounded-md border border-[#d8e7dd] bg-white p-4 sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[#102019]">Customer follow-up</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Buttons, badges, and account headers use the selected primary color.
                </p>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Preview action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#d8e7dd] bg-white p-4">
      <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[#102019]">{value}</p>
      <div className="mt-4 h-2 rounded-full bg-[#edf5f0]">
        <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}
