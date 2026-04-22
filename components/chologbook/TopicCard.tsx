"use client";

import { useMemo } from "react";
import { computeStreak, sortLogsNewestFirst } from "@/lib/chologbook/date-logic";
import { getLogType, getLogsByTopic } from "@/lib/chologbook/logs";
import type { Log, Topic } from "@/lib/chologbook/types";

type TopicCardProps = {
  topic: Topic;
  /** 전역 logs — 카드에서 topicId로만 필터 */
  allLogs: Log[];
  focusVisualId: string | undefined;
  onSelect: (id: string) => void;
};

export function TopicCard({
  topic,
  allLogs,
  focusVisualId,
  onSelect,
}: TopicCardProps) {
  const topicLogs = useMemo(
    () => getLogsByTopic(allLogs, topic.id),
    [allLogs, topic.id],
  );

  const patchLogs = useMemo(
    () => topicLogs.filter((l) => getLogType(l) === "patch"),
    [topicLogs],
  );

  const streak = useMemo(
    () => computeStreak(patchLogs.map((l) => l.date)),
    [patchLogs],
  );

  const previewLog = useMemo(
    () => sortLogsNewestFirst(topicLogs)[0],
    [topicLogs],
  );

  const isCurrentFocus =
    focusVisualId !== undefined && topic.id === focusVisualId;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(topic.id)}
        className={`flex w-full flex-col items-stretch gap-1 rounded-xl px-4 py-3 text-left text-sm transition ${
          isCurrentFocus
            ? "border border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-100 hover:border-emerald-400 hover:bg-emerald-50"
            : "border border-zinc-200 bg-zinc-50/50 hover:border-emerald-200 hover:bg-emerald-50/30"
        }`}
      >
        <span className="truncate font-medium text-zinc-900">{topic.title}</span>
        {isCurrentFocus ? (
          <p className="text-xs font-medium text-emerald-700">🌱 현재 집중</p>
        ) : null}
        <span className="text-xs text-zinc-600">
          🔥 {streak}일 유지 중 · 🧺 {patchLogs.length}개 쌓임
        </span>
        {previewLog ? (
          <span className="truncate text-xs text-zinc-500">→ {previewLog.text}</span>
        ) : null}
      </button>
    </li>
  );
}
