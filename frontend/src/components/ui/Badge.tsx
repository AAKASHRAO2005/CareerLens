import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "neutral"
    | "info"
    | "warning"
    | "purple"
    | "success"
    | "danger"
    | "offer"
    | "interview"
    | "applied";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-label-sm rounded-full border transition-colors select-none";

  const variantStyles = {
    default: "bg-surface-container text-primary border-primary-fixed-dim",
    neutral: "bg-surface-container text-on-surface-variant border-[#e2e8f0]",
    info: "bg-surface-container-high text-primary border-primary-fixed-dim",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    purple: "bg-surface-container-high text-secondary border-secondary-fixed",
    success: "bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim",
    danger: "bg-error-container text-on-error-container border-[#ffdad6]",
    offer: "bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim",
    interview: "bg-secondary-fixed text-on-secondary-fixed-variant border-[#c0c1ff]",
    applied: "bg-surface-container-high text-primary border-primary-fixed-dim",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-label-sm",
    md: "px-2.5 py-1 text-label-sm font-semibold",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
