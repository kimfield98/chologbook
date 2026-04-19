"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeStreak,
  formatYmd,
  hasLogForDate,
  sortLogsNewestFirst,
} from "@/lib/chologbook/date-logic";
import type { TopicsApi } from "@/hooks/useTopics";
import { debugLog } from "@/lib/debugLog";

type TopicsInput = Pick<
  TopicsApi,
  | "topics"
  | "selectedTopicId"
  | "addLog"
>;

/**
 * Patch 계층: 오늘 키·피드백·수정 입력 UI + 로그 추가 진입점
 * topics 원본은 useTopics가 소유; 여기서는 파생값·이벤트만 다룬다.
 */
export function usePatch(topicsApi: TopicsInput) {
  const { topics, selectedTopicId, addLog } = topicsApi;

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

  const selectedTopic = useMemo(
    () =>
      selectedTopicId === null
        ? undefined
        : topics.find((t) => t.id === selectedTopicId),
    [topics, selectedTopicId],
  );

  const logs = useMemo(
    () => selectedTopic?.logs ?? [],
    [selectedTopic?.logs],
  );

  const streak = useMemo(
    () => computeStreak(logs.map((l) => l.date)),
    [logs],
  );

  const sortedLogs = useMemo(() => sortLogsNewestFirst(logs), [logs]);

  const showMinorHint = logs.length >= 3;

  const alreadyPatchedToday = useMemo(
    () => todayKey !== "" && hasLogForDate(logs, todayKey),
    [todayKey, logs],
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

  const handlePatch = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || patchDisabled) return;
    if (hasLogForDate(logs, todayKey)) return;
    const entry = { date: todayKey, text: selectedTopic.title };
    const nextStreak = computeStreak(
      [...logs, entry].map((l) => l.date),
    );
    addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
    debugLog("patch:quick", { topicId: selectedTopicId, entry, nextStreak });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    logs,
    todayKey,
    addLog,
    showPatchSuccessFeedback,
  ]);

  const handleSaveEditPatch = useCallback(() => {
    if (!selectedTopicId || !selectedTopic || patchDisabled) return;
    if (hasLogForDate(logs, todayKey)) return;
    const text = editPatchText.trim() || selectedTopic.title;
    const entry = { date: todayKey, text };
    const nextStreak = computeStreak(
      [...logs, entry].map((l) => l.date),
    );
    addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
    debugLog("patch:edit", { topicId: selectedTopicId, entry, nextStreak });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    logs,
    todayKey,
    editPatchText,
    addLog,
    showPatchSuccessFeedback,
  ]);

  const openEditPatch = useCallback(() => {
    if (!selectedTopic) return;
    const lastLog = logs[logs.length - 1];
    setEditPatchText(lastLog?.text || selectedTopic.title);
    setEditPatchOpen(true);
  }, [selectedTopic, logs]);

  return {
    todayKey,
    selectedTopic,
    logs,
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
