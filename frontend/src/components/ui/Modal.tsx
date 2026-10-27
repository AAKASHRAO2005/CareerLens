"use client";

import React, { useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full rounded-xl bg-surface-container-lowest p-6 shadow-2xl border border-[#e2e8f0] z-10 space-y-4 max-h-[90vh] overflow-y-auto",
          maxWidthStyles[maxWidth]
        )}
      >
        <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <h3
              id="modal-title"
              className="font-headline-sm text-headline-sm text-on-surface tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-outline hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
