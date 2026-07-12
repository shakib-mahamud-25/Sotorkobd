interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_CLASSES = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  interactive = false,
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)]
        bg-[var(--color-surface)] shadow-[var(--shadow-xs)]
        transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]
        ${PADDING_CLASSES[padding]}
        ${interactive ? "cursor-pointer hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5" : ""}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
