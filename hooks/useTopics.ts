"use client";

import { useCallback, useState } from "react";
import { newTopicId } from "@/lib/chologbook/id";
import { INITIAL_TOPICS } from "@/lib/chologbook/migrate";
import type { Topic } from "@/lib/chologbook/types";

/**
 * Topic 그룹만 관리 (로그는 useLogs 전역 배열).
 */
export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [lastFocusTopicId, setLastFocusTopicId] = useState<string | null>(
    "1",
  );

  const selectTopic = useCallback((id: string) => {
    setLastFocusTopicId(id);
    setSelectedTopicId(id);
  }, []);

  const goHome = useCallback(() => {
    setSelectedTopicId(null);
  }, []);

  const createTopic = useCallback((title: string) => {
    const id = newTopicId();
    const topic: Topic = { id, title };
    setTopics((prev) => [...prev, topic]);
    setLastFocusTopicId(id);
    return topic;
  }, []);

  return {
    topics,
    selectedTopicId,
    setSelectedTopicId,
    lastFocusTopicId,
    setLastFocusTopicId,
    selectTopic,
    goHome,
    createTopic,
  };
}

export type TopicsApi = ReturnType<typeof useTopics>;
