"use client";

import { useEffect, useRef, useCallback } from "react";
import { XIcon } from "@/components/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, wide = false, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap: keep Tab/Shift+Tab within the modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  // Auto-focus first input element on open, restore on close
  useEffect(() => {
    if (!open) return;

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first INPUT element (not button) inside the dialog
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector<HTMLElement>(
          'input, select, textarea'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [open]);

  // Keyboard handler for focus trap and escape
  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="animate-fade-up flex max-h-[85vh] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
        style={{ width: wide ? 620 : 460, maxWidth: "95vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F0F2F5] px-[22px] py-4">
          <h3 id="modal-title" className="text-base font-bold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#FAFBFD] text-gray-500 hover:bg-gray-200 cursor-pointer"
          >
            <XIcon />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-[22px]">{children}</div>
      </div>
    </div>
  );
}
