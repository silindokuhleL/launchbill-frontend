import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalSize = "md" | "lg" | "xl";

type ModalProps = {
  children: ReactNode;
  closeLabel: string;
  eyebrow?: string;
  isCloseDisabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title: string;
};

const sizeClasses: Record<ModalSize, string> = {
  md: "sm:max-w-2xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

export function modalPanelClass(size: ModalSize = "md") {
  return `max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:rounded-lg sm:p-6 ${sizeClasses[size]}`;
}

export function Modal({
  children,
  closeLabel,
  eyebrow,
  isCloseDisabled = false,
  isOpen,
  onClose,
  size = "md",
  title,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-end bg-[#071b12]/45 p-0 sm:place-items-center sm:p-6"
      role="dialog"
    >
      <section className={modalPanelClass(size)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className={eyebrow ? "mt-2 text-2xl font-bold text-[#102019]" : "text-2xl font-bold text-[#102019]"}>
              {title}
            </h2>
          </div>
          <button
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[#102019] transition hover:bg-[#eef7f1] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCloseDisabled}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}
