"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { demoUsers } from "@/lib/demo-users";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("owner@launchbill.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.isReady && auth.isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await auth.login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Login failed. Make sure the backend is running and the seeded demo users exist.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen w-full place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm lg:grid-cols-[1fr_420px]">
        <div className="bg-[var(--brand-dark)] p-6 text-white sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[#a7dabb]">
            AI-assisted billing SaaS
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            Login as different users before we build the billing core.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#dbeee2]">
            Use seeded roles to test owner, billing, viewer, and platform access while
            every new module stays protected behind the API.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {demoUsers.map((user) => (
              <button
                className="rounded-md border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15"
                key={user.email}
                onClick={() => {
                  setEmail(user.email);
                  setPassword("password");
                }}
                type="button"
              >
                <p className="font-bold">{user.label}</p>
                <p className="mt-1 text-sm text-[#dbeee2]">{user.role}</p>
                <p className="mt-3 break-all text-xs text-[#bfe6cc]">{user.email}</p>
              </button>
            ))}
          </div>
        </div>

        <form className="p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#102019]">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Demo password for seeded users is <strong>password</strong>.
          </p>

          {error ? (
            <div className="mt-5">
              <Alert title="Could not sign in" message={error} tone="error" />
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-bold text-[#102019]" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />

          <label className="mt-5 block text-sm font-bold text-[#102019]" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />

          <Button className="mt-6 w-full" isLoading={isSubmitting} type="submit">
            Sign in to dashboard
          </Button>
        </form>
      </section>
    </main>
  );
}
