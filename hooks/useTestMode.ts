"use client";

import { useCallback, useMemo, useState } from "react";
import { formatYmd, hasLogForDate } from "@/lib/chologbook/date-logic";
import { getLogsByTopic } from "@/lib/chologbook/logs";
import type { LogInput, LogsApi } from "@/hooks/useLogs";
import type { TopicsApi } from "@/hooks/useTopics";
import type { Log } from "@/lib/chologbook/types";
import { debugLog } from "@/lib/debugLog";

type UseTestModeArgs = Pick<TopicsApi, "topics" | "selectedTopicId"> &
  Pick<LogsApi, "logs" | "addLog" | "clearLogsForTopic" | "replaceLogsForTopic"> & {
    todayKey: string;
  };

/**
 * 테스트 패널 — 전역 logs만 addLog / replaceLogsForTopic / clearLogsForTopic으로 조작.
 */
export function useTestMode({
  topics,
  selectedTopicId,
  logs,
  todayKey,
  addLog,
  clearLogsForTopic,
  replaceLogsForTopic,
}: UseTestModeArgs) {
  const [isTestMode, setIsTestMode] = useState(true);
  const [testPanelOpen, setTestPanelOpen] = useState(false);

  const selectedTopic = useMemo(
    () =>
      selectedTopicId === null
        ? undefined
        : topics.find((t) => t.id === selectedTopicId),
    [topics, selectedTopicId],
  );

  const topicLogs = useMemo((): Log[] => {
    if (!selectedTopicId) return [];
    return getLogsByTopic(logs, selectedTopicId);
  }, [logs, selectedTopicId]);

  const testAddPastDay = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || !todayKey) return;
    const existing = new Set(topicLogs.map((l) => l.date));
    for (let k = 1; k < 400; k += 1) {
      const d = new Date();
      d.setDate(d.getDate() - k);
      const key = formatYmd(d);
      if (!existing.has(key)) {
        addLog(selectedTopicId, {
          date: key,
          text: `${selectedTopic.title} (테스트 -${k}일)`,
        });
        debugLog("test:addPastDay", { topicId: selectedTopicId, date: key });
        return;
      }
    }
  }, [selectedTopicId, selectedTopic, todayKey, topicLogs, addLog]);

  const testForceMinor = useCallback(() => {
    if (!selectedTopicId || !selectedTopic) return;
    const next: LogInput[] = topicLogs.map((l) => ({
      date: l.date,
      text: l.text,
    }));
    const existingDates = new Set(next.map((e) => e.date));
    for (let k = 1; next.length < 3 && k < 400; k += 1) {
      const d = new Date();
      d.setDate(d.getDate() - k);
      const key = formatYmd(d);
      if (!existingDates.has(key)) {
        existingDates.add(key);
        next.push({
          date: key,
          text: `${selectedTopic.title} (Minor 테스트)`,
        });
      }
    }
    replaceLogsForTopic(selectedTopicId, next);
    debugLog("test:forceMinor", { topicId: selectedTopicId, count: next.length });
  }, [
    selectedTopicId,
    selectedTopic,
    topicLogs,
    replaceLogsForTopic,
  ]);

  const testResetLogs = useCallback(() => {
    if (!selectedTopicId) return;
    clearLogsForTopic(selectedTopicId);
    debugLog("test:reset", { topicId: selectedTopicId });
  }, [selectedTopicId, clearLogsForTopic]);

  const testAddTodayLog = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || !todayKey) return;
    if (hasLogForDate(topicLogs, todayKey)) return;
    addLog(selectedTopicId, {
      date: todayKey,
      text: selectedTopic.title,
    });
    debugLog("test:addToday", { topicId: selectedTopicId });
  }, [selectedTopicId, selectedTopic, todayKey, topicLogs, addLog]);

  return {
    isTestMode,
    setIsTestMode,
    testPanelOpen,
    setTestPanelOpen,
    testAddPastDay,
    testForceMinor,
    testResetLogs,
    testAddTodayLog,
    selectedTopic,
    topicLogs,
  };
}
