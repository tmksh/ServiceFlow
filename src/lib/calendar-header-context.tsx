"use client";

import { createContext, useContext, useState } from "react";
import type { CalendarGroup } from "@/types";

interface CalendarHeaderContextValue {
  activeGroup: CalendarGroup | null;
  setActiveGroup: (g: CalendarGroup | null) => void;
}

const CalendarHeaderContext = createContext<CalendarHeaderContextValue>({
  activeGroup: null,
  setActiveGroup: () => {},
});

export function CalendarHeaderProvider({ children }: { children: React.ReactNode }) {
  const [activeGroup, setActiveGroup] = useState<CalendarGroup | null>(null);
  return (
    <CalendarHeaderContext.Provider value={{ activeGroup, setActiveGroup }}>
      {children}
    </CalendarHeaderContext.Provider>
  );
}

export function useCalendarHeader() {
  return useContext(CalendarHeaderContext);
}
