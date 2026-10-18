"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── MODAL ──────────────────────────────────────────────────────────────── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-modal border border-[#E5E5EA] animate-slide-up z-10",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13.5px] text-[#6E6E73] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ─── SHEET ──────────────────────────────────────────────────────────────── */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 z-10 flex flex-col bg-white shadow-modal border-[#E5E5EA] w-full max-w-md animate-slide-up transition-transform",
          side === "right"
            ? "right-0 border-l"
            : "left-0 border-r",
          className
        )}
        role="dialog"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#F0F0F2]">
          {title && (
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">{title}</h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-md text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────── */

export function Toast({
  message,
  type = "info",
  onDismiss,
}: {
  message: string;
  type?: "info" | "success" | "error";
  onDismiss?: () => void;
}) {
  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-[#E8F8EE] text-[#1D7F3E] border-[#C1EAD0]";
      case "error":
        return "bg-[#FDEEEF] text-[#C42B37] border-[#F9CBD0]";
      case "info":
      default:
        return "bg-white text-[#1D1D1F] border-[#E5E5EA]";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card text-[13.5px] font-medium animate-slide-up",
        getColors()
      )}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 p-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
