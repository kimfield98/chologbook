"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TopicList } from "@/components/chologbook/TopicList";
import { useAuth } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { usePatch } from "@/hooks/usePatch";
import { useTopics } from "@/hooks/useTopics";
import { getFocusTopicId } from "@/lib/chologbook/getFocusTopicId";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AppProvider } from "./AppContext";

type TabLinkProps = {
  href: string;
  label: string;
  active: boolean;
};

function TabLink({ href, label, active }: TabLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

const APP_TABS = [
  { href: "/app/patch", base: "/app/patch", label: "Patch" },
  { href: "/app/minor", base: "/app/minor", label: "Minor" },
  { href: "/app/major", base: "/app/major", label: "Major" },
  { href: "/app/blog", base: "/app/blog", label: "Blog" },
] as const;

export default function AppShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSession = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authSession.isLoading) return;
    if (authSession.userId) return;
    if (!pathname?.startsWith("/app")) return;
    router.replace("/");
  }, [authSession.isLoading, authSession.userId, pathname, router]);

  const dataUserId = authSession.userId ?? "";

  const effectiveViewMode = "mine" as const;

  const canWrite = Boolean(authSession.userId);

  const logsApi = useLogs({ userId: dataUserId || undefined });
  const topicsApi = useTopics({
    userId: dataUserId || undefined,
    logs: logsApi.logs,
  });

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

  const [topicPickerOpen, setTopicPickerOpen] = useState(true);
  const focusVisualId = useMemo(
    () => getFocusTopicId(topicsApi.selectedTopicId, topicsApi.lastFocusTopicId),
    [topicsApi.selectedTopicId, topicsApi.lastFocusTopicId],
  );

  const handleHeaderSelectTopic = useCallback(
    (id: string) => {
      topicsApi.selectTopic(id);
    },
    [topicsApi],
  );

  const showTopicPicker = topicsApi.topics.length > 0;
  const onBlogRoute = Boolean(
    pathname === "/app/blog" || pathname?.startsWith("/app/blog/"),
  );
  const showTopicChrome = !onBlogRoute;

  const ctxValue = useMemo(
    () =>
      ({
        authSession,
        viewMode: effectiveViewMode,
        setViewMode: () => {},
        effectiveViewMode,
        dataUserId,
        canWrite,
        logsApi,
        topicsApi,
        patch,
      }) as const,
    [authSession, effectiveViewMode, dataUserId, canWrite, logsApi, topicsApi, patch],
  );

  const tabActive = (base: string) => {
    if (base === "/app/blog") {
      return pathname === "/app/blog" || Boolean(pathname?.startsWith("/app/blog/"));
    }
    return pathname === base || Boolean(pathname?.startsWith(`${base}/`));
  };

  if (authSession.isLoading || !authSession.userId) {
    const label = authSession.isLoading
      ? "불러오는 중…"
      : "로그인이 필요해요. 이동 중…";
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        {label}
      </div>
    );
  }

  return (
    <AppProvider value={ctxValue}>
      <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto w-full max-w-md px-4 py-4">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                CHOLOGBOOK
              </button>
              {showAccountBar ? (
                <p className="max-w-full truncate px-2 pt-0.5 text-center text-xs font-medium text-zinc-600">
                  {authSession.user?.email ?? authSession.userId}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden px-4 pb-32 pt-6">
          {showTopicChrome ? (
            <div className="mb-4 shrink-0">
              {showTopicPicker ? (
                <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100">
                  <button
                    type="button"
                    aria-expanded={topicPickerOpen}
                    onClick={() => setTopicPickerOpen((o) => !o)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left transition hover:bg-zinc-50/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {selectedTopicTitle || "Topic 선택"}
                      </p>
                      {!topicPickerOpen ? (
                        <p className="truncate text-xs text-zinc-500">내 흐름</p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 text-xs text-zinc-400 transition-transform duration-200 ${
                        topicPickerOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      topicPickerOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-zinc-100 px-2 pb-3 pt-1 [&_ul]:mt-2">
                        <TopicList
                          topics={topicsApi.topics}
                          allLogs={logsApi.logs}
                          focusVisualId={focusVisualId}
                          onSelectTopic={handleHeaderSelectTopic}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {selectedTopicTitle || "Topic 없음"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">내 흐름</p>
                </div>
              )}
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col justify-center">{children}</div>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200/70 bg-white/90 backdrop-blur">
          <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {APP_TABS.map((t) => (
              <TabLink
                key={t.base}
                href={t.href}
                label={t.label}
                active={tabActive(t.base)}
              />
            ))}
          </div>
        </nav>
      </div>
    </AppProvider>
  );
}
