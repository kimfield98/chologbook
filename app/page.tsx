"use client";

import { useEffect, useMemo, useState } from "react";
import { TopicDetail } from "@/components/chologbook/TopicDetail";
import { TopicList } from "@/components/chologbook/TopicList";
import { TestPanel } from "@/components/chologbook/TestPanel";
import { useAuth } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { usePatch } from "@/hooks/usePatch";
import { useTestMode } from "@/hooks/useTestMode";
import { useTopics } from "@/hooks/useTopics";
import { getFocusTopicId } from "@/lib/chologbook/getFocusTopicId";
import { debugLog } from "@/lib/debugLog";
import { isFirebaseConfigured } from "@/lib/firebase";

const INSTALL_GUIDE_DISMISSED_KEY = "chologbook.installGuideDismissed";

/**
 * 페이지: Topic(useTopics) + 전역 Log(useLogs) + Patch·테스트 훅 조합.
 * 로그의 단일 소스는 `logs` 배열이며, Topic은 그룹(id/title)만 담당한다.
 */
export default function Home() {
  const authSession = useAuth();
  const logsApi = useLogs({ userId: authSession.userId });
  const topicsApi = useTopics({
    userId: authSession.userId,
    logs: logsApi.logs,
  });

  const patch = usePatch({
    topics: topicsApi.topics,
    selectedTopicId: topicsApi.selectedTopicId,
    logs: logsApi.logs,
    addLog: logsApi.addLog,
  });

  const test = useTestMode({
    topics: topicsApi.topics,
    selectedTopicId: topicsApi.selectedTopicId,
    logs: logsApi.logs,
    todayKey: patch.todayKey,
    addLog: logsApi.addLog,
    clearLogsForTopic: logsApi.clearLogsForTopic,
    replaceLogsForTopic: logsApi.replaceLogsForTopic,
  });

  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const focusVisualId = useMemo(
    () =>
      getFocusTopicId(
        topicsApi.selectedTopicId,
        topicsApi.lastFocusTopicId,
      ),
    [topicsApi.selectedTopicId, topicsApi.lastFocusTopicId],
  );

  const isHome = topicsApi.selectedTopicId === null;

  useEffect(() => {
    const dismissed =
      window.localStorage.getItem(INSTALL_GUIDE_DISMISSED_KEY) === "1";
    setShowInstallGuide(!dismissed);
  }, []);

  if (authSession.isLoading) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
        <p className="text-sm font-medium text-zinc-500">연결 중…</p>
      </div>
    );
  }

  function handleOpenNewTopicPanel() {
    debugLog("Topic 버튼 클릭됨", "인라인 입력 패널 오픈");
    setNewTopicName("");
    setNewTopicOpen(true);
  }

  function handleCreateNewTopic() {
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
    window.localStorage.setItem(INSTALL_GUIDE_DISMISSED_KEY, "1");
  }

  const showAccountBar = isFirebaseConfigured();

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      {showAccountBar ? (
        <div className="absolute right-4 top-4 flex max-w-[min(100%,20rem)] flex-col items-end gap-1 sm:right-6 sm:top-6">
          {authSession.user && !authSession.isAnonymous ? (
            <span
              className="truncate text-right text-xs font-medium text-zinc-600"
              title={authSession.user.email ?? authSession.userId}
            >
              {authSession.user.email ?? authSession.userId}
            </span>
          ) : (
            <>
              {authSession.user && authSession.isAnonymous ? (
                <p className="max-w-[16rem] text-right text-sm leading-snug text-gray-500">
                  Google로 로그인하면 기록이 계정 기준으로 새롭게 저장됩니다.
                </p>
              ) : null}
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
            </>
          )}
        </div>
      ) : null}

      <main className="w-full max-w-md">
        {isHome ? (
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
              CHOLOGBOOK
            </p>
            <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900">
              Topics
            </h1>
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
                  브라우저 공유 버튼에서 홈 화면 추가를 선택하면 더 빠르게
                  기록할 수 있어요.
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

            <TopicList
              topics={topicsApi.topics}
              allLogs={logsApi.logs}
              focusVisualId={focusVisualId}
              onSelectTopic={topicsApi.selectTopic}
            />
          </section>
        ) : patch.selectedTopic ? (
          <TopicDetail
            onHome={topicsApi.goHome}
            title={patch.selectedTopic.title}
            streak={patch.streak}
            patchCount={patch.patchCount}
            sortedLogs={patch.sortedLogs}
            referenceLogsPatchMinor={patch.referenceLogsPatchMinor}
            latestNextPatchDirection={patch.latestNextPatchDirection}
            showMajorTimingMessage={patch.showMajorTimingMessage}
            canStartMajor={patch.canStartMajor}
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
            showMinorFork={patch.showMinorFork}
            minorInputMode={patch.minorInputMode}
            minorDraftText={patch.minorDraftText}
            onMinorDraftText={patch.setMinorDraftText}
            onContinueRecording={patch.handleContinueRecording}
            onOpenMinorInput={patch.handleOpenMinorInput}
            onCancelMinor={patch.handleCancelMinor}
            onSaveMinor={patch.handleSaveMinor}
            todayKey={patch.todayKey}
            alreadyPatchedToday={patch.alreadyPatchedToday}
            patchDisabled={patch.patchDisabled}
            feedbackMessage={patch.feedbackMessage}
            editPatchOpen={patch.editPatchOpen}
            editPatchText={patch.editPatchText}
            onEditPatchText={patch.setEditPatchText}
            onPatch={patch.handlePatch}
            onOpenEditPatch={patch.openEditPatch}
            onCloseEditPatch={() => patch.setEditPatchOpen(false)}
            onSaveEditPatch={patch.handleSaveEditPatch}
          />
        ) : null}
      </main>

      <TestPanel
        isTestMode={test.isTestMode}
        setIsTestMode={test.setIsTestMode}
        testPanelOpen={test.testPanelOpen}
        setTestPanelOpen={test.setTestPanelOpen}
        selectedTopicId={topicsApi.selectedTopicId}
        selectedTopic={test.selectedTopic}
        topicLogs={test.topicLogs}
        todayKey={patch.todayKey}
        onTestAddToday={test.testAddTodayLog}
        onTestAddPastDay={test.testAddPastDay}
        onTestForceMinor={test.testForceMinor}
        onTestReset={test.testResetLogs}
      />
    </div>
  );
}
