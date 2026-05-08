"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopicDetail } from "@/components/chologbook/TopicDetail";
import { TopicList } from "@/components/chologbook/TopicList";
import { useAuth } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { usePatch } from "@/hooks/usePatch";
import { useTopics } from "@/hooks/useTopics";
import { getFocusTopicId } from "@/lib/chologbook/getFocusTopicId";
import {
  INSTALL_GUIDE_COOKIE,
} from "@/lib/chologbook/installGuideCookie";
import { PUBLIC_OWNER_LABEL, PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";
import { debugLog } from "@/lib/debugLog";
import { isFirebaseConfigured } from "@/lib/firebase";

type HomeClientProps = {
  initialShowInstallGuide: boolean;
};

export default function HomeClient({ initialShowInstallGuide }: HomeClientProps) {
  const authSession = useAuth();

  const [viewMode, setViewMode] = useState<"public" | "mine">("public");
  const effectiveViewMode = authSession.userId ? viewMode : "public";
  const dataUserId =
    effectiveViewMode === "public"
      ? PUBLIC_OWNER_UID
      : (authSession.userId ?? PUBLIC_OWNER_UID);

  const canWrite = Boolean(authSession.userId) && effectiveViewMode === "mine";

  const logsApi = useLogs({ userId: dataUserId });
  const topicsApi = useTopics({
    userId: dataUserId,
    logs: logsApi.logs,
  });

  const patch = usePatch({
    topics: topicsApi.topics,
    selectedTopicId: topicsApi.selectedTopicId,
    logs: logsApi.logs,
    addLog: logsApi.addLog,
    canWrite,
  });

  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(
    initialShowInstallGuide,
  );
  const [landingOpen, setLandingOpen] = useState(true);

  const focusVisualId = useMemo(
    () =>
      getFocusTopicId(
        topicsApi.selectedTopicId,
        topicsApi.lastFocusTopicId,
      ),
    [topicsApi.selectedTopicId, topicsApi.lastFocusTopicId],
  );

  const isHome = topicsApi.selectedTopicId === null;

  if (authSession.isLoading) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
        <p className="text-sm font-medium text-zinc-500">연결 중…</p>
      </div>
    );
  }

  function handleOpenNewTopicPanel() {
    if (!canWrite) return;
    debugLog("Topic 버튼 클릭됨", "인라인 입력 패널 오픈");
    setNewTopicName("");
    setNewTopicOpen(true);
  }

  function handleCreateNewTopic() {
    if (!canWrite) return;
    debugLog("Topic 추가 확인(저장 또는 Enter)", { raw: newTopicName });
    if (!newTopicName.trim()) {
      debugLog("[케이스] 이름 비어 있음 — Topic 미생성");
      return;
    }
    const topic = topicsApi.createTopic(newTopicName.trim());
    setNewTopicName("");
    setNewTopicOpen(false);
    debugLog("Topic 생성됨", topic);
  }

  function handleDismissInstallGuide() {
    setInstallGuideOpen(false);
    setShowInstallGuide(false);
    document.cookie = `${INSTALL_GUIDE_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
  }

  const showAccountBar = isFirebaseConfigured();

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      {showAccountBar ? (
        <div className="absolute right-4 top-4 flex max-w-[min(100%,20rem)] flex-col items-end gap-1 sm:right-6 sm:top-6">
          {authSession.user ? (
            <span
              className="truncate text-right text-xs font-medium text-zinc-600"
              title={authSession.user.email ?? authSession.userId}
            >
              {authSession.user.email ?? authSession.userId}
            </span>
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
          )}
        </div>
      ) : null}

      <main className="w-full max-w-md">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("public")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                effectiveViewMode === "public"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {PUBLIC_OWNER_LABEL}
            </button>
            {authSession.userId ? (
              <button
                type="button"
                onClick={() => setViewMode("mine")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  effectiveViewMode === "mine"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                내 초록북
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Blog
            </Link>
            {!authSession.userId ? (
              <button
                type="button"
                onClick={() => void authSession.signInWithGoogle()}
                disabled={authSession.isGooglePopupPending}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {authSession.isGooglePopupPending ? "연결 중…" : "나도 시작해보기"}
              </button>
            ) : null}
          </div>
        </div>

        {effectiveViewMode === "public" ? (
          <p className="mb-3 text-center text-xs text-zinc-500">
            운영자의 실제 흐름 (읽기 전용)
          </p>
        ) : null}

        {isHome ? (
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
              CHOLOGBOOK
            </p>
            <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900">
              오늘의 행동이 흐름이 되도록
            </h1>
            <p className="mt-3 text-center text-sm leading-relaxed text-zinc-600">
              초록북은{" "}
              <span className="font-semibold text-zinc-900">
                행동 → 생각 → 흐름
              </span>
              으로 이어지는 기록을 돕는 공간이에요.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setLandingOpen(false)}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                운영자 초록북 보기
              </button>
              {canWrite ? (
                <button
                  type="button"
                  onClick={() => {
                    setLandingOpen(false);
                    handleOpenNewTopicPanel();
                  }}
                  className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-100/70"
                >
                  오늘의 행동 기록하기
                </button>
              ) : (
                <p className="text-center text-xs text-zinc-500">
                  기록은 로그인 후에 가능해요.
                </p>
              )}
            </div>
            {canWrite ? (
              <button
                type="button"
                onClick={() => {
                  debugLog("[케이스1] +Topic 버튼 클릭됨");
                  handleOpenNewTopicPanel();
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
              >
                + Topic 추가
              </button>
            ) : (
              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-center text-sm text-zinc-700">
                기록은 로그인 후에만 가능해요.
              </div>
            )}

            {showInstallGuide ? (
              <section
                aria-labelledby="install-guide-title"
                className="mt-3 rounded-xl border border-zinc-300 bg-zinc-100/80 p-4"
              >
                <h2
                  id="install-guide-title"
                  className="text-sm font-semibold text-zinc-900"
                >
                  홈 화면에 추가해서 앱처럼 사용해보세요
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-700">
                  브라우저 공유 버튼에서 홈 화면 추가를 선택하면 더 빠르게 기록할
                  수 있어요.
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleDismissInstallGuide}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200"
                  >
                    다시 보지 않기
                  </button>
                  <button
                    type="button"
                    aria-expanded={installGuideOpen}
                    aria-controls="install-guide-details"
                    onClick={() => setInstallGuideOpen((open) => !open)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                  >
                    {installGuideOpen ? "설치 방법 닫기" : "설치 방법 보기"}
                  </button>
                </div>
              </section>
            ) : null}

            {showInstallGuide && installGuideOpen ? (
              <section
                id="install-guide-details"
                aria-label="홈 화면 설치 방법"
                className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    iPhone (Safari)
                  </h3>
                  <p className="mt-1 text-sm text-zinc-700">
                    공유 버튼을 누른 뒤 홈 화면에 추가를 선택하고 추가를
                    눌러주세요.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Android (Chrome)
                  </h3>
                  <p className="mt-1 text-sm text-zinc-700">
                    메뉴(⋮)에서 홈 화면에 추가 또는 앱 설치를 선택한 뒤 설치를
                    눌러주세요.
                  </p>
                </div>
                <p className="rounded-lg bg-white px-3 py-2 text-sm text-zinc-600">
                  설치 후 홈 화면 아이콘으로 열면 더 앱처럼 사용할 수 있어요.
                </p>
              </section>
            ) : null}

            {newTopicOpen ? (
              <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
                <p className="text-xs text-zinc-500">
                  반복하고 싶은 습관이나 기록을 하나 만들어보세요
                </p>
                <label className="block text-xs font-medium text-zinc-600">
                  새 Topic 이름
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateNewTopic();
                    }
                  }}
                  placeholder="예: 영어 회화"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-400 focus:ring-2"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      debugLog("Topic 추가 취소");
                      setNewTopicName("");
                      setNewTopicOpen(false);
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewTopic}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            ) : null}

            {!landingOpen ? (
              <div className="mt-6">
                <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Topics
                </p>
                <TopicList
                  topics={topicsApi.topics}
                  allLogs={logsApi.logs}
                  focusVisualId={focusVisualId}
                  onSelectTopic={topicsApi.selectTopic}
                />
              </div>
            ) : null}
          </section>
        ) : patch.selectedTopic ? (
          <TopicDetail
            onHome={topicsApi.goHome}
            onDeleteTopic={() => {
              if (!canWrite || !topicsApi.selectedTopicId) return;
              const ok = window.confirm(
                "이 Topic을 삭제할까요?\n해당 Topic의 모든 기록(Patch/Minor/Major)도 함께 삭제됩니다.",
              );
              if (!ok) return;
              const id = topicsApi.selectedTopicId;
              topicsApi.goHome();
              topicsApi.deleteTopic(id);
              logsApi.clearLogsForTopic(id);
            }}
            canWrite={canWrite}
            title={patch.selectedTopic.title}
            totalPatchCount={patch.totalPatchCount}
            sortedLogs={patch.sortedLogs}
            referenceLogsPatchMinor={patch.referenceLogsPatchMinor}
            latestNextPatchDirection={patch.latestNextPatchDirection}
            canStartMajor={patch.canStartMajor}
            majorLockHint={patch.majorLockHint}
            majorProgressLabel={patch.majorProgressLabel}
            onOpenMajorComposer={patch.handleOpenMajorComposer}
            majorInputMode={patch.majorInputMode}
            majorDraftChange={patch.majorDraftChange}
            onMajorDraftChange={patch.setMajorDraftChange}
            majorDraftMoment={patch.majorDraftMoment}
            onMajorDraftMoment={patch.setMajorDraftMoment}
            majorDraftNext={patch.majorDraftNext}
            onMajorDraftNext={patch.setMajorDraftNext}
            onCancelMajor={patch.handleCancelMajor}
            onSaveMajor={patch.handleSaveMajor}
            majorSaveDisabled={patch.majorSaveDisabled}
            minorInputMode={patch.minorInputMode}
            minorDraftText={patch.minorDraftText}
            onMinorDraftText={patch.setMinorDraftText}
            alreadyMinoredToday={patch.alreadyMinoredToday}
            minorOpenDisabled={patch.minorOpenDisabled}
            onOpenMinorInput={patch.handleOpenMinorInput}
            onCancelMinor={patch.handleCancelMinor}
            onSaveMinor={patch.handleSaveMinor}
            todayKey={patch.todayKey}
            alreadyPatchedToday={patch.alreadyPatchedToday}
            patchDisabled={patch.patchDisabled}
            feedbackMessage={patch.feedbackMessage}
            onPatch={patch.handlePatch}
          />
        ) : null}
      </main>
    </div>
  );
}

