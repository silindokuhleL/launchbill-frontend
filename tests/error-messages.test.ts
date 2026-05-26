import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage, retryLabel } from "@/lib/error-messages";

describe("error message helpers", () => {
  it("prefers API response messages", () => {
    const error = new AxiosError("Network failed", "ERR_BAD_RESPONSE", undefined, null, {
      config: {},
      data: {
        message: "The plan list is unavailable.",
      },
      headers: {},
      status: 503,
      statusText: "Service Unavailable",
    });

    expect(getApiErrorMessage(error, "Could not load data.")).toBe(
      "The plan list is unavailable.",
    );
  });

  it("falls back to regular error messages before generic text", () => {
    expect(getApiErrorMessage(new Error("Connection refused"), "Could not load data.")).toBe(
      "Connection refused",
    );
    expect(getApiErrorMessage(null, "Could not load data.")).toBe("Could not load data.");
  });

  it("normalizes retry button labels", () => {
    expect(retryLabel(" Plans ")).toBe("Retry plans");
  });
});
