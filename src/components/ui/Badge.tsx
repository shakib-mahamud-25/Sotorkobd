type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: React.ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  info: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
  accent: "bg-[var(--color-accent)]/12 text-[var(--color-accent-hover)]",
};

export function Badge({
  tone = "neutral",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1
        text-[10px] font-semibold uppercase tracking-wide
        ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
