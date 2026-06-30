import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal, modalPanelClass } from "@/components/ui/modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal closeLabel="Close modal" isOpen={false} onClose={() => null} title="Hidden">
        Hidden content
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders an accessible dialog and calls close", () => {
    const onClose = vi.fn();

    render(
      <Modal
        closeLabel="Close billing modal"
        eyebrow="Billing"
        isOpen
        onClose={onClose}
        title="Create plan"
      >
        <p>Plan form fields</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).not.toBeNull();
    expect(screen.getByText("Billing")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Create plan" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close billing modal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses stable size classes", () => {
    expect(modalPanelClass("md")).toContain("sm:max-w-2xl");
    expect(modalPanelClass("lg")).toContain("sm:max-w-3xl");
    expect(modalPanelClass("xl")).toContain("sm:max-w-5xl");
  });
});
