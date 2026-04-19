"use client";

import { useMemo, useState } from "react";
import { TopicDetail } from "@/components/chologbook/TopicDetail";
import { TopicList } from "@/components/chologbook/TopicList";
import { TestPanel } from "@/components/chologbook/TestPanel";
import { usePatch } from "@/hooks/usePatch";
import { useTestMode } from "@/hooks/useTestMode";
import { useTopics } from "@/hooks/useTopics";
import { getFocusTopicId } from "@/lib/chologbook/getFocusTopicId";
import { debugLog } from "@/lib/debugLog";

/**
 * 페이지: 훅(데이터 / Patch / 테스트) + 프레젠테이션 컴포넌트만 조합.
 * — topics·네비·집중 id → useTopics
 * — 오늘·피드백·수정 Patch UI → usePatch
 * — 테스트 패널·주입 액션 → useTestMode
 */
export default function Home() {
  const topicsApi = useTopics();
  const patch = usePatch(topicsApi);
  const test = useTestMode({
    topics: topicsApi.topics,
    selectedTopicId: topicsApi.selectedTopicId,
    todayKey: patch.todayKey,
    addLog: topicsApi.addLog,
    setTopicLogs: topicsApi.setTopicLogs,
  });

  /** 홈 전용: 새 Topic 인라인 폼 (데이터 훅과 분리) */
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  const focusVisualId = useMemo(
    () =>
      getFocusTopicId(
        topicsApi.selectedTopicId,
        topicsApi.lastFocusTopicId,
      ),
    [topicsApi.selectedTopicId, topicsApi.lastFocusTopicId],
  );

  const isHome = topicsApi.selectedTopicId === null;

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

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
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
              focusVisualId={focusVisualId}
              onSelectTopic={topicsApi.selectTopic}
            />
          </section>
        ) : patch.selectedTopic ? (
          <TopicDetail
            onHome={topicsApi.goHome}
            title={patch.selectedTopic.title}
            streak={patch.streak}
            logs={patch.logs}
            sortedLogs={patch.sortedLogs}
            showMinorHint={patch.showMinorHint}
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
        todayKey={patch.todayKey}
        onTestAddToday={test.testAddTodayLog}
        onTestAddPastDay={test.testAddPastDay}
        onTestForceMinor={test.testForceMinor}
        onTestReset={test.testResetLogs}
      />
    </div>
  );
}
