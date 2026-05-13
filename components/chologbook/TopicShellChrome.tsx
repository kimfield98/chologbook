"use client";

import { useEffect, useState } from "react";
import { TopicCreateForm } from "@/components/chologbook/TopicCreateForm";
import { TopicList } from "@/components/chologbook/TopicList";
import { useAppContext } from "@/app/app/AppContext";
import { patchIdleCtaFullWidth } from "@/lib/ui/appButtonStyles";
import type { Log, Topic } from "@/lib/chologbook/types";

const topicAddButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50";

type TopicShellChromeProps = {
  topics: Topic[];
  allLogs: Log[];
  focusVisualId: string | undefined;
  selectedTopicTitle: string;
  canWrite: boolean;
  isSignInPending?: boolean;
  onSelectTopic: (id: string) => void;
  onCreateTopic: (title: string) => void;
  onRenameTopic: (id: string, title: string) => void;
  onDeleteTopic: (id: string) => void;
  onRequestSignIn: () => void;
  preferCollapsed?: boolean;
};

export function TopicShellChrome({
  topics,
  allLogs,
  focusVisualId,
  selectedTopicTitle,
  canWrite,
  onSelectTopic,
  onCreateTopic,
  onRenameTopic,
  onDeleteTopic,
  onRequestSignIn,
  isSignInPending = false,
  preferCollapsed = false,
}: TopicShellChromeProps) {
  const hasTopics = topics.length > 0;
  const [topicPickerOpen, setTopicPickerOpen] = useState(true);
  const [newTopicOpen, setNewTopicOpen] = useState(!hasTopics);
  const [newTopicName, setNewTopicName] = useState("");

  useEffect(() => {
    if (!hasTopics) {
      setTopicPickerOpen(true);
      setNewTopicOpen(true);
      return;
    }
    setNewTopicOpen(false);
    setNewTopicName("");
  }, [hasTopics]);

  useEffect(() => {
    if (!preferCollapsed || !hasTopics) return;
    setTopicPickerOpen(false);
    setNewTopicOpen(false);
    setNewTopicName("");
  }, [preferCollapsed, hasTopics]);

  function handleCreateTopic() {
    if (!canWrite) return;
    const title = newTopicName.trim();
    if (!title) return;
    onCreateTopic(title);
    setNewTopicName("");
    setNewTopicOpen(false);
  }

  function handleOpenNewTopicPanel() {
    if (!canWrite) {
      onRequestSignIn();
      return;
    }
    setNewTopicName("");
    setNewTopicOpen(true);
    setTopicPickerOpen(true);
  }

  const addTopicButtonLabel = !canWrite
    ? isSignInPending
      ? "로그인 연결 중…"
      : "로그인하고 토픽 생성하기"
    : "+ Topic 추가";

  if (!hasTopics) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm font-semibold text-zinc-900">Topic을 만들어보세요</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">반복하고 싶은 행동의 묶음을 만들어보세요.</p>
        {canWrite && newTopicOpen ? (
          <div className="mt-3">
            <TopicCreateForm
              value={newTopicName}
              onChange={setNewTopicName}
              onSubmit={handleCreateTopic}
              autoFocus
              submitLabel="만들고 시작하기"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOpenNewTopicPanel}
            disabled={isSignInPending}
            className={`mt-3 ${topicAddButtonClass}`}
          >
            {addTopicButtonLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100">
      <button
        type="button"
        aria-expanded={topicPickerOpen}
        onClick={() => setTopicPickerOpen((open) => !open)}
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
          <div className="space-y-3 border-t border-zinc-100 px-2 pb-3 pt-1 [&_ul]:mt-2">
            <TopicList
              topics={topics}
              allLogs={allLogs}
              focusVisualId={focusVisualId}
              onSelectTopic={onSelectTopic}
              canWrite={canWrite}
              onRenameTopic={onRenameTopic}
              onDeleteTopic={onDeleteTopic}
            />
            {!newTopicOpen ? (
              <button
                type="button"
                onClick={handleOpenNewTopicPanel}
                disabled={isSignInPending}
                className={topicAddButtonClass}
              >
                {addTopicButtonLabel}
              </button>
            ) : null}
            {canWrite && newTopicOpen ? (
              <TopicCreateForm
                value={newTopicName}
                onChange={setNewTopicName}
                onSubmit={handleCreateTopic}
                onCancel={() => {
                  setNewTopicName("");
                  setNewTopicOpen(false);
                }}
                autoFocus
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopicEmptyState() {
  const { patch, canWrite } = useAppContext();

  return (
    <section className="flex flex-1 flex-col justify-center gap-5 py-6">
      <div className="flex min-h-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="w-full space-y-3">
          <p className="text-center text-xs font-semibold text-zinc-500">Patch 기록하기</p>
          {patch.latestNextPatchDirection ? (
            <div className="flex items-start justify-center gap-2 text-sm text-emerald-800">
              <div className="min-w-0">
                <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80">
                  다음 흐름
                </p>
                <p className="mt-1 whitespace-pre-wrap text-center font-bold leading-relaxed text-emerald-900/90">
                  {patch.latestNextPatchDirection}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-400">
              {canWrite
                ? "Topic을 만든 뒤 오늘의 Patch를 남겨 보세요."
                : "Topic을 만든 뒤, 하루에 한 번 실행 여부를 기록해요."}
            </p>
          )}

          <button type="button" disabled className={patchIdleCtaFullWidth}>
            오늘도 했어요
          </button>

          {patch.feedbackMessage ? (
            <p className="text-center text-sm font-medium text-emerald-700">
              {patch.feedbackMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
