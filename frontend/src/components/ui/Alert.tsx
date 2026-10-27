import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

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
      container: "bg-blue-50/80 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />,
    },
    success: {
      container: "bg-emerald-50/80 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />,
    },
    warning: {
      container: "bg-amber-50/80 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />,
    },
    danger: {
      container: "bg-rose-50/80 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />,
    },
  };

  const { container, icon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn("flex items-start gap-3 p-4 rounded-xl border text-sm", container, className)}
      {...props}
    >
      {icon}
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold leading-none">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};
