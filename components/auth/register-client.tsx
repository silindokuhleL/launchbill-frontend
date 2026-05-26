"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  buildRegistrationPayload,
  canSubmitRegistration,
  defaultBillingEmail,
  registrationPasswordRules,
} from "@/lib/auth-registration";
import { useAuth } from "@/lib/auth-context";
import type { RegistrationFormValues } from "@/types/auth";

const initialValues: RegistrationFormValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  accountName: "",
  billingEmail: "",
};

type RegisterClientProps = {
  inviteCode?: string | null;
};

export function RegisterClient({ inviteCode = null }: RegisterClientProps) {
  const router = useRouter();
  const auth = useAuth();
  const [values, setValues] = useState<RegistrationFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = useMemo(
    () => registrationPasswordRules(values.password),
    [values.password],
  );
  const canSubmit = canSubmitRegistration(values);
  const resolvedBillingEmail = defaultBillingEmail(values.email, values.billingEmail);

  useEffect(() => {
    if (auth.isReady && auth.isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  function updateField(field: keyof RegistrationFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Complete the required fields and make sure the password rules pass.");
      return;
    }

    setIsSubmitting(true);

    try {
      await auth.register(buildRegistrationPayload(values));
      router.replace("/dashboard");
    } catch {
      setError("Could not create the account. Check the details or try another email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full px-4 py-8 sm:px-6">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[var(--brand-dark)] p-6 text-white sm:p-8 lg:p-10">
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-[#dbeee2] transition hover:bg-white/15"
            href="/login"
          >
            Sign in instead
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[#a7dabb]">
            Create owner workspace
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            Start a LaunchBill account with owner access.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#dbeee2]">
            Register the first user for a tenant, then use roles, plans, customers,
            subscriptions, invoices, payments, settings, and AI tools from the protected app.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              {
                icon: Building2,
                title: "Tenant workspace",
                text: "Creates your account and links you as the owner.",
              },
              {
                icon: ShieldCheck,
                title: "RBAC-ready",
                text: "Owner access is assigned immediately by the API.",
              },
              {
                icon: MailCheck,
                title: "Billing contact",
                text: "Use a separate billing email or reuse your login email.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="rounded-md border border-white/15 bg-white/10 p-4"
                  key={item.title}
                >
                  <div className="flex gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#a7dabb]" />
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#dbeee2]">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="rounded-md border border-[#b7d8c3] bg-[#eff8f2] p-4">
            <p className="text-sm font-bold text-[#17452c]">
              {inviteCode ? "Invite detected" : "New account setup"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#587064]">
              {inviteCode
                ? "Invite acceptance UI is ready. The invite token will connect to the API when the backend invite endpoint is added."
                : "Use this form when you are creating the first account owner for a LaunchBill workspace."}
            </p>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-[#102019]">Create account</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Passwords must use at least 10 characters, with letters and numbers.
            </p>

            {error ? (
              <div className="mt-5">
                <Alert title="Registration needs attention" message={error} tone="error" />
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[#102019]" htmlFor="name">
                Full name
                <input
                  autoComplete="name"
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                  id="name"
                  onChange={(event) => updateField("name", event.target.value)}
                  type="text"
                  value={values.name}
                />
              </label>

              <label className="block text-sm font-bold text-[#102019]" htmlFor="email">
                Work email
                <input
                  autoComplete="email"
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                  id="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  type="email"
                  value={values.email}
                />
              </label>
            </div>

            <label
              className="mt-5 block text-sm font-bold text-[#102019]"
              htmlFor="accountName"
            >
              Account or business name
              <input
                autoComplete="organization"
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                id="accountName"
                onChange={(event) => updateField("accountName", event.target.value)}
                type="text"
                value={values.accountName}
              />
            </label>

            <label
              className="mt-5 block text-sm font-bold text-[#102019]"
              htmlFor="billingEmail"
            >
              Billing email
              <input
                autoComplete="email"
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                id="billingEmail"
                onChange={(event) => updateField("billingEmail", event.target.value)}
                placeholder="Optional"
                type="email"
                value={values.billingEmail}
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Billing contact will be {resolvedBillingEmail || "set after you enter an email"}.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[#102019]" htmlFor="password">
                Password
                <input
                  autoComplete="new-password"
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                  id="password"
                  onChange={(event) => updateField("password", event.target.value)}
                  type="password"
                  value={values.password}
                />
              </label>

              <label
                className="block text-sm font-bold text-[#102019]"
                htmlFor="passwordConfirmation"
              >
                Confirm password
                <input
                  autoComplete="new-password"
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#bfe6cc]"
                  id="passwordConfirmation"
                  onChange={(event) =>
                    updateField("passwordConfirmation", event.target.value)
                  }
                  type="password"
                  value={values.passwordConfirmation}
                />
              </label>
            </div>

            <div className="mt-5 grid gap-2 rounded-md border border-[var(--border)] p-4">
              {passwordRules.map((rule) => (
                <div className="flex items-center gap-2 text-sm" key={rule.id}>
                  <CheckCircle2
                    className={`h-4 w-4 ${rule.passes ? "text-[var(--brand)]" : "text-[#91a89b]"}`}
                    aria-hidden="true"
                  />
                  <span className={rule.passes ? "text-[#17452c]" : "text-[var(--muted)]"}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="mt-6 w-full"
              disabled={!canSubmit}
              isLoading={isSubmitting}
              type="submit"
            >
              Create owner account
            </Button>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Already have access?{" "}
              <Link className="font-bold text-[var(--brand)]" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
