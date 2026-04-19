"use client";

import type { Topic } from "@/lib/chologbook/types";
import { TopicCard } from "@/components/chologbook/TopicCard";

type TopicListProps = {
  topics: Topic[];
  focusVisualId: string | undefined;
  onSelectTopic: (id: string) => void;
};

export function TopicList({
  topics,
  focusVisualId,
  onSelectTopic,
}: TopicListProps) {
  return (
    <ul className="mt-4 space-y-2">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          focusVisualId={focusVisualId}
          onSelect={onSelectTopic}
        />
      ))}
    </ul>
  );
}
