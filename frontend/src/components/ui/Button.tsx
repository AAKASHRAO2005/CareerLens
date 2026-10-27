import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "tertiary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-label-md rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-primary-container text-on-primary hover:bg-primary active:scale-[0.98] shadow-sm",
      secondary:
        "bg-surface-container-lowest text-on-surface border border-[#cbd5e1] hover:bg-surface-container-low active:scale-[0.98] shadow-sm",
      outline:
        "border border-outline-variant text-on-surface bg-surface-container-lowest hover:bg-surface-container-low active:scale-[0.98]",
      danger:
        "bg-error text-on-error hover:bg-[#93000a] active:scale-[0.98] shadow-sm",
      ghost:
        "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
      tertiary:
        "bg-tertiary text-on-tertiary hover:bg-tertiary-container active:scale-[0.98] shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-label-sm gap-1.5",
      md: "h-9 px-4 text-label-md gap-2",
      lg: "h-11 px-6 text-body-md gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
