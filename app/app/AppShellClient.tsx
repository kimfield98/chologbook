"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { usePatch } from "@/hooks/usePatch";
import { useTopics } from "@/hooks/useTopics";
import { PUBLIC_OWNER_LABEL, PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AppProvider } from "./AppContext";

type ViewMode = "public" | "mine";

type TabLinkProps = {
  href: string;
  label: string;
  active: boolean;
};

function TabLink({
  href,
  label,
  active,
}: TabLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AppShellClient({ children }: { children: React.ReactNode }) {
  const authSession = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>("public");
  const effectiveViewMode: ViewMode = authSession.userId ? viewMode : "public";
  const dataUserId =
    effectiveViewMode === "public"
      ? PUBLIC_OWNER_UID
      : (authSession.userId ?? PUBLIC_OWNER_UID);
  const canWrite = Boolean(authSession.userId) && effectiveViewMode === "mine";

  const logsApi = useLogs({ userId: dataUserId });
  const topicsApi = useTopics({ userId: dataUserId, logs: logsApi.logs });

  const patch = usePatch({
    topics: topicsApi.topics,
    selectedTopicId: topicsApi.selectedTopicId,
    logs: logsApi.logs,
    addLog: logsApi.addLog,
    canWrite,
  });

  const showAccountBar = isFirebaseConfigured();

  const selectedTopicTitle = useMemo(() => {
    const id = topicsApi.selectedTopicId;
    if (!id) return "";
    return topicsApi.topics.find((t) => t.id === id)?.title ?? "";
  }, [topicsApi.selectedTopicId, topicsApi.topics]);

  const ctxValue = useMemo(
    () =>
      ({
        authSession,
        viewMode,
        setViewMode,
        effectiveViewMode,
        dataUserId,
        canWrite,
        logsApi,
        topicsApi,
        patch,
      }) as const,
    [
      authSession,
      viewMode,
      effectiveViewMode,
      dataUserId,
      canWrite,
      logsApi,
      topicsApi,
      patch,
    ],
  );

  const active = (href: string) =>
    pathname === href || (href !== "/app/profile" && pathname?.startsWith(href));

  const tabs = useMemo(
    () =>
      [
        { href: "/app/patch", label: "Patch" },
        { href: "/app/minor", label: "Minor" },
        { href: "/app/major", label: "Major" },
        { href: "/app/profile", label: "Profile" },
      ] as const,
    [],
  );

  return (
    <AppProvider value={ctxValue}>
      <div className="min-h-dvh flex flex-col bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto w-full max-w-md px-4 py-6">
            <div className="relative flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                CHOLOGBOOK
              </button>

              <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {showAccountBar && !authSession.userId ? (
                  <button
                    type="button"
                    onClick={() => void authSession.signInWithGoogle()}
                    disabled={authSession.isGooglePopupPending}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {authSession.isGooglePopupPending ? "연결 중…" : "로그인"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col px-4 pt-6 pb-32">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {selectedTopicTitle || "Topic 선택"}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {effectiveViewMode === "public"
                    ? "운영자 흐름을 보고 있어요."
                    : "내 흐름을 기록하고 있어요."}
                </p>
          </div>

              <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("public")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    effectiveViewMode === "public"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  운영자 초록북
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mine")}
                  disabled={!authSession.userId}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    effectiveViewMode === "mine"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  내 초록북
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md my-auto">
            {children}
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200/70 bg-white/90 backdrop-blur">
          <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {tabs.map((t) => (
              <TabLink key={t.href} href={t.href} label={t.label} active={active(t.href)} />
            ))}
          </div>
        </nav>
      </div>
    </AppProvider>
  );
}

