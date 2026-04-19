"use client";

import { useCallback, useState } from "react";
import { getLogsByTopic, stampLog } from "@/lib/chologbook/logs";
import { INITIAL_LOGS } from "@/lib/chologbook/migrate";
import type { Log } from "@/lib/chologbook/types";

export type LogInput = { date: string; text: string };

/**
 * 전역 Log 목록 — 모든 Patch·테스트 기록의 단일 소스.
 * Topic은 id/title만 갖고, 연결은 topicId로만 한다.
 */
export function useLogs() {
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);

  /**
   * 해당 Topic·날짜에 이미 있으면 무시 (하루 1회, Strict Mode 이중 호출 안전).
   */
  const addLog = useCallback((topicId: string, entry: LogInput) => {
    setLogs((prev) => {
      const forTopic = getLogsByTopic(prev, topicId);
      if (forTopic.some((l) => l.date === entry.date)) return prev;
      return [...prev, stampLog(topicId, entry)];
    });
  }, []);

  const clearLogsForTopic = useCallback((topicId: string) => {
    setLogs((prev) => prev.filter((l) => l.topicId !== topicId));
  }, []);

  /** 테스트용: 해당 Topic 로그만 통째로 교체(항목마다 새 id) */
  const replaceLogsForTopic = useCallback(
    (topicId: string, entries: LogInput[]) => {
      setLogs((prev) => {
        const rest = prev.filter((l) => l.topicId !== topicId);
        const added = entries.map((e) => stampLog(topicId, e));
        return [...rest, ...added];
      });
    },
    [],
  );

  return {
    logs,
    setLogs,
    addLog,
    clearLogsForTopic,
    replaceLogsForTopic,
  };
}

export type LogsApi = ReturnType<typeof useLogs>;
