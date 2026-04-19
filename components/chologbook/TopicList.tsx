"use client";

import type { Log, Topic } from "@/lib/chologbook/types";
import { TopicCard } from "@/components/chologbook/TopicCard";

type TopicListProps = {
  topics: Topic[];
  allLogs: Log[];
  focusVisualId: string | undefined;
  onSelectTopic: (id: string) => void;
};

export function TopicList({
  topics,
  allLogs,
  focusVisualId,
  onSelectTopic,
}: TopicListProps) {
  return (
    <ul className="mt-4 space-y-2">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          allLogs={allLogs}
          focusVisualId={focusVisualId}
          onSelect={onSelectTopic}
        />
      ))}
    </ul>
  );
}
