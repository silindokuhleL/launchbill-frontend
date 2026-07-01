import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip, tooltipPanelClass } from "@/components/ui/tooltip";

describe("Tooltip", () => {
  it("connects an element trigger to tooltip content", () => {
    render(
      <Tooltip content="Refresh dashboard metrics and recent invoices." id="refresh-tip">
        <button type="button">Refresh</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Refresh" });
    const tooltip = screen.getByRole("tooltip");

    expect(trigger.getAttribute("aria-describedby")).toContain("refresh-tip");
    expect(tooltip.getAttribute("id")).toBe("refresh-tip");
    expect(tooltip.textContent).toContain("Refresh dashboard metrics");
  });

  it("keeps existing descriptions when adding tooltip support", () => {
    render(
      <Tooltip content="Shows billing health." id="billing-tip">
        <button aria-describedby="existing-help" type="button">
          Billing health
        </button>
      </Tooltip>,
    );

    expect(
      screen.getByRole("button", { name: "Billing health" }).getAttribute("aria-describedby"),
    ).toBe("existing-help billing-tip");
  });

  it("wraps plain text triggers with a described element", () => {
    render(
      <Tooltip content="Plain text trigger." id="plain-tip">
        Status
      </Tooltip>,
    );

    expect(screen.getByText("Status").getAttribute("aria-describedby")).toBe(
      "plain-tip",
    );
  });

  it("uses stable side classes", () => {
    expect(tooltipPanelClass("top")).toContain("bottom-full");
    expect(tooltipPanelClass("bottom")).toContain("top-full");
    expect(tooltipPanelClass("left")).toContain("right-full");
    expect(tooltipPanelClass("right")).toContain("left-full");
  });
});
