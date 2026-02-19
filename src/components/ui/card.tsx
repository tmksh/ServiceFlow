"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
