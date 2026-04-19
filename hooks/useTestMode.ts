"use client";

import { useCallback, useState } from "react";
import { formatYmd, hasLogForDate } from "@/lib/chologbook/date-logic";
import type { TopicsApi } from "@/hooks/useTopics";
import { debugLog } from "@/lib/debugLog";

type UseTestModeArgs = Pick<
  TopicsApi,
  "selectedTopicId" | "addLog" | "setTopicLogs"
> & {
  todayKey: string;
  topics: TopicsApi["topics"];
};

/**
 * 테스트 계층: 플래그·패널 UI + 개발용 로그 주입
 * 실제 데이터 변경은 addLog / setTopicLogs 한 경로로만 한다.
 */
export function useTestMode({
  topics,
  selectedTopicId,
  todayKey,
  addLog,
  setTopicLogs,
}: UseTestModeArgs) {
  const [isTestMode, setIsTestMode] = useState(true);
  const [testPanelOpen, setTestPanelOpen] = useState(false);

  const selectedTopic =
    selectedTopicId === null
      ? undefined
      : topics.find((t) => t.id === selectedTopicId);

  const testAddPastDay = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || !todayKey) return;
    const existing = new Set(selectedTopic.logs.map((l) => l.date));
    for (let k = 1; k < 400; k += 1) {
      const d = new Date();
      d.setDate(d.getDate() - k);
      const key = formatYmd(d);
      if (!existing.has(key)) {
        const nextLogs = [
          ...selectedTopic.logs,
          { date: key, text: `${selectedTopic.title} (테스트 -${k}일)` },
        ];
        setTopicLogs(selectedTopicId, nextLogs);
        debugLog("test:addPastDay", { topicId: selectedTopicId, date: key });
        return;
      }
    }
  }, [selectedTopicId, selectedTopic, todayKey, setTopicLogs]);

  const testForceMinor = useCallback(() => {
    if (!selectedTopicId || !selectedTopic) return;
    const next = [...selectedTopic.logs];
    const existingDates = new Set(next.map((l) => l.date));
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
    setTopicLogs(selectedTopicId, next);
    debugLog("test:forceMinor", { topicId: selectedTopicId, count: next.length });
  }, [selectedTopicId, selectedTopic, setTopicLogs]);

  const testResetLogs = useCallback(() => {
    if (!selectedTopicId) return;
    setTopicLogs(selectedTopicId, []);
    debugLog("test:reset", { topicId: selectedTopicId });
  }, [selectedTopicId, setTopicLogs]);

  const testAddTodayLog = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || !todayKey) return;
    if (hasLogForDate(selectedTopic.logs, todayKey)) return;
    addLog(selectedTopicId, {
      date: todayKey,
      text: selectedTopic.title,
    });
    debugLog("test:addToday", { topicId: selectedTopicId });
  }, [selectedTopicId, selectedTopic, todayKey, addLog]);

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
  };
}
