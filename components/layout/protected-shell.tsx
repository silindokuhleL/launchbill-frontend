"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Menu, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonPanel } from "@/components/ui/skeleton";
import { navigationItems } from "@/lib/navigation";
import { useAuth } from "@/lib/auth-context";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (auth.isReady && !auth.isAuthenticated) {
      router.replace("/login");
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );

  if (!auth.isReady || !auth.isAuthenticated || !auth.user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <SkeletonPanel />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f5]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          <button
            aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] lg:hidden"
            onClick={() => setIsNavOpen((value) => !value)}
            type="button"
          >
            {isNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--brand-dark)] text-white">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#102019]">LaunchBill</p>
              <p className="truncate text-xs text-[var(--muted)]">
                {activeAccount?.name ?? "Platform workspace"}
              </p>
            </div>
          </div>
          {auth.user.accounts.length ? (
            <select
              aria-label="Active account"
              className="hidden min-h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[#102019] sm:block"
              onChange={(event) => auth.setActiveAccountId(Number(event.target.value))}
              value={auth.activeAccountId ?? ""}
            >
              {auth.user.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          ) : null}
          <Button onClick={() => auth.logout()} variant="secondary">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${isNavOpen ? "block" : "hidden"} border-b border-[var(--border)] bg-white p-3 lg:block lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r`}
        >
          <nav className="grid gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <a
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#e5f4eb] text-[var(--brand-dark)]"
                      : "text-[#365548] hover:bg-[#f0f7f2]"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsNavOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
