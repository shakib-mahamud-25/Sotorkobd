import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

type AlertTone = "danger" | "warning" | "success" | "info";

const TONE_CONFIG: Record<AlertTone, { classes: string; Icon: typeof Info }> = {
  danger: {
    classes: "bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] text-[var(--color-danger)]",
    Icon: AlertTriangle,
  },
  warning: {
    classes: "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-accent-hover)]",
    Icon: ShieldAlert,
  },
  success: {
    classes: "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]",
    Icon: CheckCircle2,
  },
  info: {
    classes: "bg-[var(--color-info-bg)] border-[var(--color-info-border)] text-[var(--color-secondary)]",
    Icon: Info,
  },
};

export function Alert({
  tone = "info",
  children,
  className = "",
}: {
  tone?: AlertTone;
  children: React.ReactNode;
  className?: string;
}) {
  const { classes, Icon } = TONE_CONFIG[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`animate-fade-in flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm leading-relaxed ${classes} ${className}`}
    >
      <Icon size={17} className="mt-0.5 flex-none" />
      <div className="text-[var(--color-text-primary)]">{children}</div>
    </div>
  );
}
