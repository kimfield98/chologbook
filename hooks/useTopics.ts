"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addTopicToFirestore, getTopicsFromFirestore } from "@/lib/chologbook/firestoreTopics";
import { newTopicId } from "@/lib/chologbook/id";
import { INITIAL_TOPICS } from "@/lib/chologbook/migrate";
import { mergeRemoteTopicsWithLogs } from "@/lib/chologbook/mergeTopicsWithLogs";
import type { Log } from "@/lib/chologbook/types";
import type { Topic } from "@/lib/chologbook/types";
import { initFirebase, isFirebaseConfigured } from "@/lib/firebase";

type UseTopicsOptions = {
  userId: string | undefined;
  /** Firestore 로그와 topicId를 맞추기 위해 전달(토픽 미동기화 레거시 복구). */
  logs: Log[];
};

/**
 * Topic 그룹 — Firebase 설정 시 Firestore `topics`와 동기화하고,
 * 로그에만 있는 topicId는 제목을 로그에서 추정해 복구한다.
 */
export function useTopics({ userId, logs }: UseTopicsOptions) {
  const firebaseOn = isFirebaseConfigured();
  /** Firebase 미사용 시에만 쓰는 로컬 토픽 목록 */
  const [localModeTopics, setLocalModeTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [remoteTopics, setRemoteTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [lastFocusRaw, setLastFocusRaw] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseOn || !userId?.trim()) {
      queueMicrotask(() => {
        setRemoteTopics([]);
      });
      return;
    }

    initFirebase();
    let cancelled = false;
    void getTopicsFromFirestore(userId).then((rows) => {
      if (!cancelled) setRemoteTopics(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, firebaseOn]);

  const topics = useMemo(() => {
    if (!firebaseOn) {
      return localModeTopics;
    }
    if (!userId?.trim()) {
      return INITIAL_TOPICS;
    }
    return mergeRemoteTopicsWithLogs(remoteTopics, logs, INITIAL_TOPICS);
  }, [firebaseOn, localModeTopics, userId, remoteTopics, logs]);

  /** 시드 id("1") 등이 사라진 뒤에도 홈 강조가 유효한 Topic을 가리키도록 보정 */
  const lastFocusTopicId = useMemo(() => {
    if (lastFocusRaw && topics.some((t) => t.id === lastFocusRaw)) {
      return lastFocusRaw;
    }
    return topics[0]?.id ?? null;
  }, [topics, lastFocusRaw]);

  const selectTopic = useCallback((id: string) => {
    setLastFocusRaw(id);
    setSelectedTopicId(id);
  }, []);

  const goHome = useCallback(() => {
    setSelectedTopicId(null);
  }, []);

  const createTopic = useCallback(
    (title: string) => {
      const id = newTopicId();
      const topic: Topic = { id, title };

      if (!firebaseOn) {
        setLocalModeTopics((prev) => [...prev, topic]);
      } else if (userId?.trim()) {
        setRemoteTopics((prev) => [...prev, topic]);
        void addTopicToFirestore(userId, topic).catch((e) => {
          console.error("[useTopics] Topic Firestore 저장 실패", e);
          setRemoteTopics((prev) => prev.filter((t) => t.id !== topic.id));
        });
      } else {
        setLocalModeTopics((prev) => [...prev, topic]);
      }

      setLastFocusRaw(id);
      return topic;
    },
    [firebaseOn, userId],
  );

  return {
    topics,
    selectedTopicId,
    setSelectedTopicId,
    lastFocusTopicId,
    setLastFocusTopicId: setLastFocusRaw,
    selectTopic,
    goHome,
    createTopic,
  };
}

export type TopicsApi = ReturnType<typeof useTopics>;
