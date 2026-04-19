"use client";

import { useCallback, useState } from "react";
import { newTopicId } from "@/lib/chologbook/id";
import type { Log, Topic } from "@/lib/chologbook/types";

/**
 * 데이터 계층: Topic 목록·네비게이션 id·집중(홈 맥락) id
 * UI·Patch·테스트는 이 훅이 제공하는 addLog / setTopicLogs로만 topics를 갱신한다.
 */
export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "경제책 읽기", logs: [] },
  ]);
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

  /**
   * 단일 진입점: 동일 날짜가 이미 있으면 상태를 바꾸지 않음(Strict Mode 이중 호출에도 안전).
   */
  const addLog = useCallback((topicId: string, entry: Log) => {
    setTopics((prev) => {
      const topic = prev.find((t) => t.id === topicId);
      if (!topic || topic.logs.some((l) => l.date === entry.date)) {
        return prev;
      }
      return prev.map((t) =>
        t.id === topicId ? { ...t, logs: [...t.logs, entry] } : t,
      );
    });
  }, []);

  const setTopicLogs = useCallback((topicId: string, nextLogs: Log[]) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, logs: nextLogs } : t)),
    );
  }, []);

  const createTopic = useCallback((title: string) => {
    const id = newTopicId();
    const topic: Topic = { id, title, logs: [] };
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
    addLog,
    setTopicLogs,
    createTopic,
  };
}

export type TopicsApi = ReturnType<typeof useTopics>;
