"use client";

import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);

  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      // Apply resistance
      const distance = Math.min(diff * 0.4, 120);
      setPullDistance(distance);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      onRefresh?.();
      // Simulate refresh completion
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 1200);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="lg:hidden flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: refreshing ? 48 : pullDistance > 0 ? pullDistance : 0 }}
      >
        <div className={cn(
          "flex items-center gap-2 text-sm",
          progress >= 1 ? "text-indigo-600" : "text-slate-400"
        )}>
          <RefreshCw
            size={18}
            className={cn(
              "transition-transform duration-200",
              refreshing && "animate-spin-slow"
            )}
            style={{ transform: refreshing ? undefined : `rotate(${progress * 360}deg)` }}
          />
          <span className="text-xs font-medium">
            {refreshing ? "更新中..." : progress >= 1 ? "離して更新" : "引っ張って更新"}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
