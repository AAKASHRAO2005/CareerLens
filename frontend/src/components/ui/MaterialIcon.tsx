"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
  filled?: boolean;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  className,
  filled = false,
  ...props
}) => {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        filled && "filled",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
};
