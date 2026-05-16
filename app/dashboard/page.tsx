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
