"use client";

import { Bot, CreditCard, Receipt, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { useAuth } from "@/lib/auth-context";

const cards = [
  { label: "Plans", value: "0", icon: CreditCard },
  { label: "Customers", value: "0", icon: Users },
  { label: "Payments", value: "0", icon: Receipt },
  { label: "AI drafts", value: "0", icon: Bot },
];

export default function DashboardPage() {
  const auth = useAuth();
  const activeAccount = auth.user?.accounts.find(
    (account) => account.id === auth.activeAccountId,
  );
  const roles = activeAccount?.roles.length
    ? activeAccount.roles
    : (auth.user?.global_roles ?? []);
  const permissions = activeAccount?.permissions.length
    ? activeAccount.permissions
    : (auth.user?.global_permissions ?? []);

  return (
    <ProtectedShell>
      <PageHeader
        eyebrow="Protected dashboard"
        title={`Welcome, ${auth.user?.name ?? "there"}`}
        description="The application shell is ready. Next we will connect real billing modules to the Laravel API one branch at a time."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <section
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
              key={card.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--muted)]">{card.label}</p>
                <Icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#102019]">{card.value}</p>
            </section>
          );
        })}
      </div>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Access preview
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#102019]">
              {activeAccount?.name ?? "Platform access"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This confirms the seeded users do not all have the same permissions.
            </p>
          </div>
          <div className="rounded-md bg-[#e5f4eb] px-4 py-3 text-sm font-bold text-[var(--brand-dark)]">
            {permissions.length} permissions
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="text-sm font-bold text-[#102019]">Roles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.length ? (
                roles.map((role) => (
                  <span
                    className="rounded-md border border-[#b7d8c3] bg-[#f4fbf6] px-3 py-1 text-sm font-semibold text-[var(--brand-dark)]"
                    key={role}
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">No role in this scope</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#102019]">Permissions</p>
            <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
              {permissions.map((permission) => (
                <span
                  className="rounded-md bg-[#edf5f0] px-3 py-1 text-xs font-semibold text-[#365548]"
                  key={permission}
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <EmptyState
          description="We now have authentication, tenant context, and navigation. Plans, customers, subscriptions, invoices, payments, team, audit, settings, and AI pages can be added without redesigning the shell."
          icon={Bot}
          title="Ready for core functionality"
        />
      </div>
    </ProtectedShell>
  );
}
