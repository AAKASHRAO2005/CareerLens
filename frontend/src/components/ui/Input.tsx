import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-[#cbd5e1] bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-outline transition-all focus-visible:outline-none focus-visible:border-primary-container focus-visible:ring-1 focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error focus-visible:border-error",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="font-label-sm text-label-sm text-error font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="font-caption text-caption text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
