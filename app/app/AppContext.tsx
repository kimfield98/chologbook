"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { usePatch } from "@/hooks/usePatch";
import type { TopicsApi } from "@/hooks/useTopics";

export type AppContextValue = {
  authSession: ReturnType<typeof useAuth>;
  canWrite: boolean;
  logsApi: ReturnType<typeof useLogs>;
  topicsApi: TopicsApi;
  patch: ReturnType<typeof usePatch>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: React.ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const v = useContext(AppContext);
  if (!v) throw new Error("useAppContext must be used within AppProvider");
  return v;
}
