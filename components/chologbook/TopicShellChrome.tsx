"use client";

import { useEffect, useState } from "react";
import { TopicCreateForm } from "@/components/chologbook/TopicCreateForm";
import { TopicList } from "@/components/chologbook/TopicList";
import type { Log, Topic } from "@/lib/chologbook/types";

type TopicShellChromeProps = {
  topics: Topic[];
  allLogs: Log[];
  focusVisualId: string | undefined;
  selectedTopicTitle: string;
  canWrite: boolean;
  onSelectTopic: (id: string) => void;
  onCreateTopic: (title: string) => void;
  onRenameTopic: (id: string, title: string) => void;
  onDeleteTopic: (id: string) => void;
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
    if (!canWrite) return;
    setNewTopicName("");
    setNewTopicOpen(true);
    setTopicPickerOpen(true);
  }

  if (!hasTopics) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm font-semibold text-zinc-900">첫 Topic을 만들어주세요</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          반복하고 싶은 습관이나 기록을 하나 만들면 Patch를 바로 남길 수 있어요.
        </p>
        {canWrite ? (
          <div className="mt-3">
            <TopicCreateForm
              value={newTopicName}
              onChange={setNewTopicName}
              onSubmit={handleCreateTopic}
              autoFocus
              submitLabel="만들기"
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">기록은 로그인 후에 가능해요.</p>
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
            {canWrite && !newTopicOpen ? (
              <button
                type="button"
                onClick={handleOpenNewTopicPanel}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
              >
                + Topic 추가
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

export function TopicEmptyState({
  canWrite,
  onCreateTopic,
}: {
  canWrite: boolean;
  onCreateTopic: (title: string) => void;
}) {
  const [newTopicName, setNewTopicName] = useState("");

  function handleCreateTopic() {
    if (!canWrite) return;
    const title = newTopicName.trim();
    if (!title) return;
    onCreateTopic(title);
    setNewTopicName("");
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-600/90">
          시작하기
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
          첫 Topic을 만들어보세요
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Topic은 반복하고 싶은 행동이나 기록의 묶음이에요. 하나만 만들어도 Patch부터
          시작할 수 있어요.
        </p>
        {canWrite ? (
          <div className="mt-5 text-left">
            <TopicCreateForm
              value={newTopicName}
              onChange={setNewTopicName}
              onSubmit={handleCreateTopic}
              autoFocus
              submitLabel="만들고 시작하기"
            />
          </div>
        ) : (
          <p className="mt-5 text-sm text-zinc-600">기록은 로그인 후에 가능해요.</p>
        )}
      </div>
    </section>
  );
}
