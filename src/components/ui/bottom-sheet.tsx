"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0) {
      sheet.style.transform = `translateY(${diff}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const diff = currentY.current - startY.current;
    if (diff > 120) {
      onClose();
    }
    sheet.style.transform = "";
    startY.current = 0;
    currentY.current = 0;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:flex lg:items-center lg:justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />

      {/* Desktop: centered modal */}
      <div className="hidden lg:block relative z-10 w-full max-w-2xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className={cn("bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up", className)}>
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        ref={sheetRef}
        className="lg:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl animate-sheet-up will-change-transform pb-safe-bottom"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="font-bold text-lg text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        )}

        <div className={cn("overflow-y-auto", className)} style={{ maxHeight: "calc(92vh - 70px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
