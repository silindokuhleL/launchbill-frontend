import { describe, expect, it } from "vitest";
import {
  buildRegistrationPayload,
  canSubmitRegistration,
  defaultBillingEmail,
  getRegistrationPasswordIssues,
  passwordsMatch,
} from "@/lib/auth-registration";
import type { RegistrationFormValues } from "@/types/auth";

const validValues: RegistrationFormValues = {
  accountName: "Acme LaunchBill",
  billingEmail: "",
  email: "owner@acme.test",
  name: "Acme Owner",
  password: "launchbill123",
  passwordConfirmation: "launchbill123",
};

describe("auth registration helpers", () => {
  it("requires the backend password rules before submit", () => {
    expect(getRegistrationPasswordIssues("short")).toEqual([
      "At least 10 characters",
      "Includes numbers",
    ]);
    expect(getRegistrationPasswordIssues("launchbill123")).toEqual([]);
  });

  it("confirms matching passwords only after a password is present", () => {
    expect(passwordsMatch("", "")).toBe(false);
    expect(passwordsMatch("launchbill123", "launchbill321")).toBe(false);
    expect(passwordsMatch("launchbill123", "launchbill123")).toBe(true);
  });

  it("uses the login email as the default billing contact", () => {
    expect(defaultBillingEmail(" owner@acme.test ", "")).toBe("owner@acme.test");
    expect(defaultBillingEmail("owner@acme.test", " billing@acme.test ")).toBe(
      "billing@acme.test",
    );
  });

  it("knows when registration can be submitted", () => {
    expect(canSubmitRegistration(validValues)).toBe(true);
    expect(
      canSubmitRegistration({
        ...validValues,
        passwordConfirmation: "different123",
      }),
    ).toBe(false);
    expect(
      canSubmitRegistration({
        ...validValues,
        email: "not-an-email",
      }),
    ).toBe(false);
  });

  it("builds the API payload expected by the backend", () => {
    expect(buildRegistrationPayload(validValues)).toEqual({
      account_name: "Acme LaunchBill",
      billing_email: "owner@acme.test",
      device_name: "launchbill-frontend",
      email: "owner@acme.test",
      name: "Acme Owner",
      password: "launchbill123",
      password_confirmation: "launchbill123",
    });
  });
});
