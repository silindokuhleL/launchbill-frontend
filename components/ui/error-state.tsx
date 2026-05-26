import { AlertTriangle, RefreshCcw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { retryLabel } from "@/lib/error-messages";

type ErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  icon?: LucideIcon;
  isRetrying?: boolean;
  onRetry?: () => void;
};

export function ErrorState({
  actionLabel = "load again",
  icon: Icon = AlertTriangle,
  isRetrying = false,
  message,
  onRetry,
  title,
}: ErrorStateProps) {
  return (
    <section className="rounded-lg border border-[#f3b4ae] bg-[#fff8f7] p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#fff1f0] text-[#b42318]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#102019]">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a3d35]">
              {message}
            </p>
          </div>
        </div>

        {onRetry ? (
          <Button
            className="w-full shrink-0 sm:w-auto"
            isLoading={isRetrying}
            onClick={onRetry}
            variant="secondary"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {retryLabel(actionLabel)}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
