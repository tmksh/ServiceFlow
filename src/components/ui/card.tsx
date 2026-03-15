"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** false を渡すと白背景の従来スタイルになる。デフォルトはリキッドグラス */
  glass?: boolean;
}

export function Card({ children, className, onClick, glass = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-300 relative overflow-hidden",
        glass
          ? "liquid-glass hover:shadow-md liquid-glass-shimmer"
          : "bg-white border border-slate-200/60 shadow-sm hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
