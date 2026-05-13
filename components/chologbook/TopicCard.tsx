"use client";

import { useEffect, useMemo, useState } from "react";
import { TopicCreateForm } from "@/components/chologbook/TopicCreateForm";
import { getLogsByTopic } from "@/lib/chologbook/logs";
import {
  countTopicVersion,
  topicVersionLabelFromLogs,
} from "@/lib/chologbook/topicVersion";
import type { Log, Topic } from "@/lib/chologbook/types";

type TopicCardProps = {
  topic: Topic;
  /** 전역 logs — 카드에서 topicId로만 필터 */
  allLogs: Log[];
  focusVisualId: string | undefined;
  onSelect: (id: string) => void;
  canWrite?: boolean;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
};

export function TopicCard({
  topic,
  allLogs,
  focusVisualId,
  onSelect,
  canWrite = false,
  onRename,
  onDelete,
}: TopicCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState(topic.title);
  const topicLogs = useMemo(
    () => getLogsByTopic(allLogs, topic.id),
    [allLogs, topic.id],
  );

  const versionLabel = useMemo(
    () => topicVersionLabelFromLogs(topicLogs),
    [topicLogs],
  );
  const versionCounts = useMemo(() => countTopicVersion(topicLogs), [topicLogs]);

  const isCurrentFocus =
    focusVisualId !== undefined && topic.id === focusVisualId;
  const showMenu = canWrite && (onRename || onDelete);

  useEffect(() => {
    if (!renameOpen) {
      setRenameDraft(topic.title);
    }
  }, [topic.title, renameOpen]);

  function handleOpenRename() {
    setMenuOpen(false);
    setRenameDraft(topic.title);
    setRenameOpen(true);
  }

  function handleCancelRename() {
    setRenameDraft(topic.title);
    setRenameOpen(false);
  }

  function handleSaveRename() {
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    if (trimmed === topic.title) {
      setRenameOpen(false);
      return;
    }
    onRename?.(topic.id, trimmed);
    setRenameOpen(false);
  }

  return (
    <li>
      <div
        className={`rounded-xl border px-4 py-3 text-sm transition ${
          isCurrentFocus
            ? "border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-100"
            : "border-zinc-200 bg-zinc-50/50"
        }`}
      >
        <div className="flex items-start gap-1">
          <button
            type="button"
            onClick={() => onSelect(topic.id)}
            className={`min-w-0 flex-1 text-left transition ${
              isCurrentFocus
                ? "hover:border-emerald-400 hover:bg-emerald-50"
                : "hover:border-emerald-200 hover:bg-emerald-50/30"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">
                {topic.title}
              </span>
              <span
                className="shrink-0 inline-flex items-center rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-700"
                title={`이 토픽의 누적: Major ${versionCounts.major}, Minor ${versionCounts.minor}, Patch ${versionCounts.patch}`}
              >
                {versionLabel}
              </span>
            </div>
            {isCurrentFocus ? (
              <p className="mt-1 text-xs font-medium text-emerald-700">🌱 현재 집중</p>
            ) : null}
          </button>
          {showMenu ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`${topic.title} 메뉴`}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                title="메뉴"
              >
                ⋯
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
                >
                  {onRename ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleOpenRename}
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                    >
                      이름 수정
                    </button>
                  ) : null}
                  {onRename && onDelete ? <div className="h-px bg-zinc-100" /> : null}
                  {onDelete ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(topic.id);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {renameOpen && onRename ? (
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <TopicCreateForm
              value={renameDraft}
              onChange={setRenameDraft}
              onSubmit={handleSaveRename}
              onCancel={handleCancelRename}
              autoFocus
              submitLabel="저장"
              helperText="표시될 Topic 이름을 바꿔요."
              label="Topic 이름"
              placeholder={topic.title}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}
