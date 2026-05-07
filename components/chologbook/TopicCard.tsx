"use client";

import { useMemo } from "react";
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

  const versionLabel = useMemo(
    () => topicVersionLabelFromLogs(topicLogs),
    [topicLogs],
  );
  const versionCounts = useMemo(() => countTopicVersion(topicLogs), [topicLogs]);

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
          <p className="text-xs font-medium text-emerald-700">🌱 현재 집중</p>
        ) : null}
      </button>
    </li>
  );
}
