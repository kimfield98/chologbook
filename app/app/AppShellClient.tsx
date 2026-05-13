"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { TopicEmptyState, TopicShellChrome } from "@/components/chologbook/TopicShellChrome";
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
        active
          ? "bg-zinc-800 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
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
  { href: "/app/memo", base: "/app/memo", label: "Memo" },
] as const;

export default function AppShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSession = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const dataUserId = authSession.userId ?? "";

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

  const handleCreateTopic = useCallback(
    (title: string) => {
      if (!canWrite) return;
      const topic = topicsApi.createTopic(title);
      topicsApi.selectTopic(topic.id);
    },
    [canWrite, topicsApi],
  );

  const handleDeleteTopic = useCallback(
    (topicId: string) => {
      if (!canWrite) return;
      const ok = window.confirm(
        "이 Topic을 삭제할까요?\n해당 Topic의 모든 기록(Patch/Minor/Major)도 함께 삭제됩니다.",
      );
      if (!ok) return;
      topicsApi.deleteTopic(topicId);
      logsApi.clearLogsForTopic(topicId);
    },
    [canWrite, topicsApi, logsApi],
  );

  const handleRenameTopic = useCallback(
    (topicId: string, title: string) => {
      if (!canWrite) return;
      topicsApi.renameTopic(topicId, title);
    },
    [canWrite, topicsApi],
  );

  const handleRequestSignIn = useCallback(() => {
    void authSession.signInWithGoogle();
  }, [authSession]);

  const hasTopics = topicsApi.topics.length > 0;
  const onMemoRoute = Boolean(
    pathname === "/app/memo" || pathname?.startsWith("/app/memo/"),
  );
  const preferTopicChromeCollapsed = Boolean(
    pathname === "/app/minor" ||
      pathname?.startsWith("/app/minor/") ||
      pathname === "/app/major" ||
      pathname?.startsWith("/app/major/"),
  );
  const showTopicChrome = !onMemoRoute;

  const ctxValue = useMemo(
    () =>
      ({
        authSession,
        canWrite,
        logsApi,
        topicsApi,
        patch,
      }) as const,
    [authSession, canWrite, logsApi, topicsApi, patch],
  );

  const tabActive = (base: string) => {
    if (base === "/app/memo") {
      return pathname === "/app/memo" || Boolean(pathname?.startsWith("/app/memo/"));
    }
    return pathname === base || Boolean(pathname?.startsWith(`${base}/`));
  };

  if (authSession.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        불러오는 중…
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
                authSession.user ? (
                  <p className="max-w-full truncate px-2 pt-0.5 text-center text-xs font-medium text-zinc-600">
                    {authSession.user.email ?? authSession.userId}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void authSession.signInWithGoogle()}
                    disabled={authSession.isGooglePopupPending}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {authSession.isGooglePopupPending
                      ? "Google 연결 중…"
                      : "Google로 로그인"}
                  </button>
                )
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden px-4 pb-32 pt-6">
          {showTopicChrome ? (
            <div className="mb-4 shrink-0">
              <TopicShellChrome
                topics={topicsApi.topics}
                allLogs={logsApi.logs}
                focusVisualId={focusVisualId}
                selectedTopicTitle={selectedTopicTitle}
                canWrite={canWrite}
                isSignInPending={authSession.isGooglePopupPending}
                onSelectTopic={handleHeaderSelectTopic}
                onCreateTopic={handleCreateTopic}
                onRenameTopic={handleRenameTopic}
                onDeleteTopic={handleDeleteTopic}
                onRequestSignIn={handleRequestSignIn}
                preferCollapsed={preferTopicChromeCollapsed}
              />
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-md min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full min-h-0 flex-1 flex-col">
              {showTopicChrome && !hasTopics ? (
                <TopicEmptyState />
              ) : (
                children
              )}
            </div>
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
