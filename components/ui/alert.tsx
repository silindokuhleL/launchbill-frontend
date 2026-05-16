import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertProps = {
  title: string;
  message: string;
  tone?: "info" | "success" | "error";
};

const tones = {
  info: {
    icon: Info,
    className: "border-[#b7d8c3] bg-[#eff8f2] text-[#17452c]",
  },
  success: {
    icon: CheckCircle2,
    className: "border-[#9ed4af] bg-[#e7f7ec] text-[#0f5132]",
  },
  error: {
    icon: AlertCircle,
    className: "border-[#f3b4ae] bg-[#fff1f0] text-[#9b1c12]",
  },
};

export function Alert({ title, message, tone = "info" }: AlertProps) {
  const Icon = tones[tone].icon;

  return (
    <div className={`flex gap-3 rounded-md border p-4 ${tones[tone].className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}
