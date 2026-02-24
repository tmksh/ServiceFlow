"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, FileText, Inbox, Phone, X } from "lucide-react";

const ACTIONS = [
  { id: "case", label: "新規案件", icon: FileText, color: "bg-indigo-500" },
  { id: "line", label: "LINE取込", icon: Inbox, color: "bg-green-500" },
  { id: "call", label: "受電登録", icon: Phone, color: "bg-violet-500" },
];

export function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-20 z-20 lg:hidden">
      {/* Action menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-16 right-0 z-20 flex flex-col gap-3 items-end animate-fab-expand">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                className="flex items-center gap-3 pl-4 pr-3 py-2.5 bg-white rounded-2xl shadow-lg border border-slate-100 active:scale-95 transition-transform"
                onClick={() => setOpen(false)}
              >
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  {action.label}
                </span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", action.color)}>
                  <action.icon size={18} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90",
          open
            ? "bg-slate-700 rotate-45 shadow-slate-300"
            : "bg-indigo-600 shadow-indigo-300 hover:bg-indigo-700"
        )}
      >
        {open ? (
          <X size={24} className="text-white -rotate-45" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </button>
    </div>
  );
}
