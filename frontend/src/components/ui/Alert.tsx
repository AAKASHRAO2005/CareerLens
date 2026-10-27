import React from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  ...props
}) => {
  const variantConfig = {
    info: {
      container: "bg-surface-container-low border-outline-variant text-on-surface",
      icon: <MaterialIcon name="info" className="text-primary text-[20px] mt-0.5 flex-shrink-0" />,
    },
    success: {
      container: "bg-tertiary-fixed/30 border-tertiary-fixed-dim text-on-surface",
      icon: <MaterialIcon name="check_circle" className="text-tertiary text-[20px] mt-0.5 flex-shrink-0" />,
    },
    warning: {
      container: "bg-secondary-fixed/30 border-secondary-fixed-dim text-on-surface",
      icon: <MaterialIcon name="warning" className="text-secondary text-[20px] mt-0.5 flex-shrink-0" />,
    },
    danger: {
      container: "bg-error-container/60 border-error-container text-on-error-container",
      icon: <MaterialIcon name="error" className="text-error text-[20px] mt-0.5 flex-shrink-0" />,
    },
  };

  const { container, icon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn("flex items-start gap-3 p-4 rounded-xl border text-body-sm", container, className)}
      {...props}
    >
      {icon}
      <div className="space-y-0.5">
        {title && <h5 className="font-label-md text-label-md font-semibold text-on-surface">{title}</h5>}
        <div className="font-body-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};
