import type { RegisterPayload, RegistrationFormValues } from "@/types/auth";

export type PasswordRule = {
  id: "length" | "letters" | "numbers";
  label: string;
  passes: boolean;
};

export function registrationPasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: "length",
      label: "At least 10 characters",
      passes: password.length >= 10,
    },
    {
      id: "letters",
      label: "Includes letters",
      passes: /[a-z]/i.test(password),
    },
    {
      id: "numbers",
      label: "Includes numbers",
      passes: /\d/.test(password),
    },
  ];
}

export function getRegistrationPasswordIssues(password: string) {
  return registrationPasswordRules(password)
    .filter((rule) => !rule.passes)
    .map((rule) => rule.label);
}

export function passwordsMatch(password: string, confirmation: string) {
  return password.length > 0 && password === confirmation;
}

export function defaultBillingEmail(email: string, billingEmail: string) {
  const trimmedBillingEmail = billingEmail.trim();

  return trimmedBillingEmail.length ? trimmedBillingEmail : email.trim();
}

export function canSubmitRegistration(values: RegistrationFormValues) {
  const requiredFields = [
    values.name,
    values.email,
    values.password,
    values.passwordConfirmation,
    values.accountName,
  ];

  return (
    requiredFields.every((value) => value.trim().length > 0) &&
    values.email.includes("@") &&
    getRegistrationPasswordIssues(values.password).length === 0 &&
    passwordsMatch(values.password, values.passwordConfirmation)
  );
}

export function buildRegistrationPayload(
  values: RegistrationFormValues,
): RegisterPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    password_confirmation: values.passwordConfirmation,
    account_name: values.accountName.trim(),
    billing_email: defaultBillingEmail(values.email, values.billingEmail),
    device_name: "launchbill-frontend",
  };
}
