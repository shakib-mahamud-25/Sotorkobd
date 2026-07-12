import { forwardRef } from "react";

const baseFieldClasses = `w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)]
  px-4 py-3 text-sm text-[var(--color-text-primary)]
  placeholder:text-[var(--color-text-muted)]
  transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]
  focus:outline-none focus:ring-[3px] focus:ring-[var(--color-primary)]/12 focus:border-[var(--color-primary)]`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`${baseFieldClasses} ${
        error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${baseFieldClasses} leading-relaxed resize-none ${
        error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
      } ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`${baseFieldClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%235c6b6e" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>')] bg-no-repeat bg-[right_1rem_center] pr-10 ${
        error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
