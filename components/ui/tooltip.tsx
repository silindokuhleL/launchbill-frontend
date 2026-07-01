import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

type TooltipSide = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  id?: string;
  side?: TooltipSide;
};

const sideClasses: Record<TooltipSide, string> = {
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
};

export function tooltipPanelClass(side: TooltipSide = "top") {
  return `pointer-events-none invisible absolute z-40 w-max max-w-[min(16rem,calc(100vw-2rem))] rounded-md bg-[#071b12] px-3 py-2 text-xs font-semibold leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${sideClasses[side]}`;
}

export function Tooltip({
  children,
  content,
  id,
  side = "top",
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = id ?? `tooltip-${generatedId}`;
  const trigger = addTooltipDescription(children, tooltipId);

  return (
    <span className="group relative inline-flex min-w-0">
      {trigger}
      <span id={tooltipId} role="tooltip" className={tooltipPanelClass(side)}>
        {content}
      </span>
    </span>
  );
}

function addTooltipDescription(children: ReactNode, tooltipId: string) {
  if (!isValidElement(children)) {
    return (
      <span aria-describedby={tooltipId} className="inline-flex min-w-0">
        {children}
      </span>
    );
  }

  const child = children as ReactElement<{ "aria-describedby"?: string }>;
  const describedBy = [child.props["aria-describedby"], tooltipId]
    .filter(Boolean)
    .join(" ");

  return cloneElement(child, {
    "aria-describedby": describedBy,
  });
}
