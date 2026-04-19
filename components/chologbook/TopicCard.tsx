"use client";

import { useMemo } from "react";
import { computeStreak } from "@/lib/chologbook/date-logic";
import type { Topic } from "@/lib/chologbook/types";

type TopicCardProps = {
  topic: Topic;
  focusVisualId: string | undefined;
  onSelect: (id: string) => void;
};

export function TopicCard({
  topic,
  focusVisualId,
  onSelect,
}: TopicCardProps) {
  const streak = useMemo(
    () => computeStreak(topic.logs.map((l) => l.date)),
    [topic.logs],
  );
  const lastLog = topic.logs[topic.logs.length - 1];
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
          🔥 {streak}일 유지 중 · 🧺 {topic.logs.length}개 쌓임
        </span>
        {topic.logs.length > 0 && lastLog ? (
          <span className="truncate text-xs text-zinc-500">→ {lastLog.text}</span>
        ) : null}
      </button>
    </li>
  );
}
