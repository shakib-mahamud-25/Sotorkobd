"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)]",
  secondary:
    "bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] active:scale-[0.98]",
  accent:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)]",
  outline:
    "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-hover-tint)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-text-primary)]",
  danger:
    "border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white active:scale-[0.98]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5 rounded-full",
  md: "px-5 py-2.5 text-sm gap-2 rounded-full",
  lg: "px-6 py-3.5 text-sm gap-2 rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-semibold
          transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]
          disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
          ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}
          ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
