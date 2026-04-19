"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeStreak,
  formatYmd,
  hasLogForDate,
  sortLogsNewestFirst,
} from "@/lib/chologbook/date-logic";
import { getLogsByTopic } from "@/lib/chologbook/logs";
import type { LogInput, LogsApi } from "@/hooks/useLogs";
import type { TopicsApi } from "@/hooks/useTopics";
import type { Topic } from "@/lib/chologbook/types";
import { debugLog } from "@/lib/debugLog";

type PatchInput = Pick<TopicsApi, "topics" | "selectedTopicId"> &
  Pick<LogsApi, "logs" | "addLog">;

/**
 * Patch UI·오늘 키·피드백.
 * 선택 Topic의 로그는 전역 `logs`에서 topicId로 필터한 파생값만 사용한다.
 */
export function usePatch({ topics, selectedTopicId, logs, addLog }: PatchInput) {
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      setTodayKey(formatYmd(new Date()));
    });
  }, []);

  const [editPatchOpen, setEditPatchOpen] = useState(false);
  const [editPatchText, setEditPatchText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const feedbackClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTopic = useMemo((): Topic | undefined => {
    if (selectedTopicId === null) return undefined;
    return topics.find((t) => t.id === selectedTopicId);
  }, [topics, selectedTopicId]);

  const topicLogs = useMemo(() => {
    if (!selectedTopicId) return [];
    return getLogsByTopic(logs, selectedTopicId);
  }, [logs, selectedTopicId]);

  const streak = useMemo(
    () => computeStreak(topicLogs.map((l) => l.date)),
    [topicLogs],
  );

  const sortedLogs = useMemo(
    () => sortLogsNewestFirst(topicLogs),
    [topicLogs],
  );

  const showMinorHint = topicLogs.length >= 3;

  const alreadyPatchedToday = useMemo(
    () => todayKey !== "" && hasLogForDate(topicLogs, todayKey),
    [todayKey, topicLogs],
  );

  const patchDisabled = useMemo(
    () => todayKey === "" || alreadyPatchedToday || !selectedTopicId,
    [todayKey, alreadyPatchedToday, selectedTopicId],
  );

  useEffect(() => {
    return () => {
      if (feedbackClearRef.current) clearTimeout(feedbackClearRef.current);
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setEditPatchOpen(false);
      setFeedbackMessage("");
      if (feedbackClearRef.current) {
        clearTimeout(feedbackClearRef.current);
        feedbackClearRef.current = null;
      }
    });
  }, [selectedTopicId]);

  const showPatchSuccessFeedback = useCallback((nextStreak: number) => {
    if (feedbackClearRef.current) clearTimeout(feedbackClearRef.current);
    const msg =
      nextStreak >= 2 ? "🔥 흐름 이어가는 중" : "✔ 잘 쌓이고 있어요";
    setFeedbackMessage(msg);
    feedbackClearRef.current = setTimeout(() => {
      setFeedbackMessage("");
      feedbackClearRef.current = null;
    }, 1800);
  }, []);

  const handlePatch = useCallback(async () => {
    console.log("[handlePatch] 실행됨", {
      patchDisabled,
      selectedTopicId,
      todayKey,
      topicLogsLen: topicLogs.length,
    });

    if (!selectedTopicId || !selectedTopic || patchDisabled) {
      console.log("[handlePatch] 조기 종료", {
        reason: !selectedTopicId
          ? "no selectedTopicId"
          : !selectedTopic
            ? "no selectedTopic"
            : "patchDisabled",
        patchDisabled,
        todayKey,
      });
      return;
    }
    if (hasLogForDate(topicLogs, todayKey)) {
      console.log("[handlePatch] 조기 종료: 이미 해당 날짜 로그 있음", {
        todayKey,
      });
      return;
    }
    const entry: LogInput = { date: todayKey, text: selectedTopic.title };
    const nextStreak = computeStreak([
      ...topicLogs.map((l) => l.date),
      entry.date,
    ]);
    await addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
    debugLog("patch:quick", { topicId: selectedTopicId, entry, nextStreak });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    topicLogs,
    todayKey,
    addLog,
    showPatchSuccessFeedback,
  ]);

  const handleSaveEditPatch = useCallback(async () => {
    console.log("[handleSaveEditPatch] 실행됨", {
      patchDisabled,
      selectedTopicId,
      todayKey,
    });
    if (!selectedTopicId || !selectedTopic || patchDisabled) {
      console.log("[handleSaveEditPatch] 조기 종료", { patchDisabled });
      return;
    }
    if (hasLogForDate(topicLogs, todayKey)) {
      console.log("[handleSaveEditPatch] 조기 종료: 중복 날짜");
      return;
    }
    const text = editPatchText.trim() || selectedTopic.title;
    const entry: LogInput = { date: todayKey, text };
    const nextStreak = computeStreak([
      ...topicLogs.map((l) => l.date),
      entry.date,
    ]);
    await addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
    debugLog("patch:edit", { topicId: selectedTopicId, entry, nextStreak });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    topicLogs,
    todayKey,
    editPatchText,
    addLog,
    showPatchSuccessFeedback,
  ]);

  const openEditPatch = useCallback(() => {
    if (!selectedTopic) return;
    const newest = sortLogsNewestFirst(topicLogs)[0];
    setEditPatchText(newest?.text || selectedTopic.title);
    setEditPatchOpen(true);
  }, [selectedTopic, topicLogs]);

  return {
    todayKey,
    selectedTopic,
    /** 선택 Topic에 한정된 로그 (상세·Patch용 파생) */
    logs: topicLogs,
    streak,
    sortedLogs,
    showMinorHint,
    alreadyPatchedToday,
    patchDisabled,
    editPatchOpen,
    setEditPatchOpen,
    editPatchText,
    setEditPatchText,
    feedbackMessage,
    handlePatch,
    handleSaveEditPatch,
    openEditPatch,
  };
}
