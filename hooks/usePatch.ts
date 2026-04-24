"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeStreak,
  formatYmd,
  hasLogForDate,
  sortLogsNewestFirst,
  sortLogsOldestFirst,
} from "@/lib/chologbook/date-logic";
import {
  buildMajorText,
  extractNextPatchDirectionFromMajor,
} from "@/lib/chologbook/majorTemplate";
import { getLogType, getLogsByTopic } from "@/lib/chologbook/logs";
import type { LogInput, LogsApi } from "@/hooks/useLogs";
import type { TopicsApi } from "@/hooks/useTopics";
import type { Topic } from "@/lib/chologbook/types";
import { debugLog } from "@/lib/debugLog";

/** Patch가 이 개수 이상이면 Minor 분기 UI */
const PATCH_COUNT_FOR_MINOR_FORK = 3;

type PatchInput = Pick<TopicsApi, "topics" | "selectedTopicId"> &
  Pick<LogsApi, "logs" | "addLog">;

/**
 * Patch UI·Minor 분기·Major 정리·오늘 키·피드백.
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

  const [minorForkDismissed, setMinorForkDismissed] = useState(false);
  const [minorInputMode, setMinorInputMode] = useState(false);
  const [minorDraftText, setMinorDraftText] = useState("");
  const prevPatchCountRef = useRef(0);

  const [majorInputMode, setMajorInputMode] = useState(false);
  const [majorDraftChange, setMajorDraftChange] = useState("");
  const [majorDraftMoment, setMajorDraftMoment] = useState("");
  const [majorDraftNext, setMajorDraftNext] = useState("");

  const selectedTopic = useMemo((): Topic | undefined => {
    if (selectedTopicId === null) return undefined;
    return topics.find((t) => t.id === selectedTopicId);
  }, [topics, selectedTopicId]);

  const topicLogs = useMemo(() => {
    if (!selectedTopicId) return [];
    return getLogsByTopic(logs, selectedTopicId);
  }, [logs, selectedTopicId]);

  const patchLogs = useMemo(
    () => topicLogs.filter((l) => getLogType(l) === "patch"),
    [topicLogs],
  );

  const minorLogs = useMemo(
    () => topicLogs.filter((l) => getLogType(l) === "minor"),
    [topicLogs],
  );

  const majorLogs = useMemo(
    () => topicLogs.filter((l) => getLogType(l) === "major"),
    [topicLogs],
  );

  const patchCount = patchLogs.length;

  useEffect(() => {
    if (!selectedTopicId) {
      prevPatchCountRef.current = 0;
      return;
    }
    if (patchCount > prevPatchCountRef.current) {
      setMinorForkDismissed(false);
    }
    prevPatchCountRef.current = patchCount;
  }, [selectedTopicId, patchCount]);

  const streak = useMemo(
    () => computeStreak(patchLogs.map((l) => l.date)),
    [patchLogs],
  );

  /** Patch / Minor / Major 시간순(오래된 것 → 최신) */
  const sortedLogs = useMemo(
    () => sortLogsOldestFirst(topicLogs),
    [topicLogs],
  );

  const referenceLogsPatchMinor = useMemo(
    () =>
      sortLogsOldestFirst(
        topicLogs.filter(
          (l) => getLogType(l) === "patch" || getLogType(l) === "minor",
        ),
      ),
    [topicLogs],
  );

  const latestNextPatchDirection = useMemo(() => {
    const newest = sortLogsNewestFirst(majorLogs)[0];
    if (!newest?.text) return "";
    const extracted = extractNextPatchDirectionFromMajor(newest.text);
    return extracted.trim();
  }, [majorLogs]);

  const canStartMajor = minorLogs.length >= 2;

  const showMajorTimingMessage = canStartMajor && !majorInputMode;

  const showMinorFork =
    patchCount >= PATCH_COUNT_FOR_MINOR_FORK &&
    !minorInputMode &&
    !minorForkDismissed &&
    !majorInputMode;

  const alreadyPatchedToday = useMemo(
    () => todayKey !== "" && hasLogForDate(topicLogs, todayKey),
    [todayKey, topicLogs],
  );

  const patchDisabled = useMemo(
    () =>
      todayKey === "" ||
      alreadyPatchedToday ||
      !selectedTopicId ||
      majorInputMode,
    [todayKey, alreadyPatchedToday, selectedTopicId, majorInputMode],
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
      setMinorForkDismissed(false);
      setMinorInputMode(false);
      setMinorDraftText("");
      setMajorInputMode(false);
      setMajorDraftChange("");
      setMajorDraftMoment("");
      setMajorDraftNext("");
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

  const handleContinueRecording = useCallback(() => {
    setMinorForkDismissed(true);
  }, []);

  const handleOpenMinorInput = useCallback(() => {
    setMinorInputMode(true);
    setMinorDraftText("");
  }, []);

  const handleCancelMinor = useCallback(() => {
    setMinorInputMode(false);
    setMinorDraftText("");
  }, []);

  const handleSaveMinor = useCallback(async () => {
    const text = minorDraftText.trim();
    if (!selectedTopicId || !selectedTopic || !todayKey || !text) return;

    await addLog(selectedTopicId, {
      date: todayKey,
      text,
      type: "minor",
    });
    setMinorInputMode(false);
    setMinorDraftText("");
    setMinorForkDismissed(true);
    debugLog("minor:saved", { topicId: selectedTopicId, date: todayKey });
  }, [
    selectedTopicId,
    selectedTopic,
    todayKey,
    minorDraftText,
    addLog,
  ]);

  const handleOpenMajorComposer = useCallback(() => {
    if (!canStartMajor) return;
    setMinorInputMode(false);
    setMajorDraftChange("");
    setMajorDraftMoment("");
    setMajorDraftNext("");
    setMajorInputMode(true);
  }, [canStartMajor]);

  const handleCancelMajor = useCallback(() => {
    setMajorInputMode(false);
    setMajorDraftChange("");
    setMajorDraftMoment("");
    setMajorDraftNext("");
  }, []);

  const majorSaveDisabled =
    !majorDraftChange.trim() ||
    !majorDraftMoment.trim() ||
    !majorDraftNext.trim() ||
    !todayKey;

  const handleSaveMajor = useCallback(async () => {
    if (
      !selectedTopicId ||
      !selectedTopic ||
      majorSaveDisabled ||
      !todayKey.trim()
    ) {
      return;
    }
    const text = buildMajorText({
      change: majorDraftChange,
      moment: majorDraftMoment,
      nextPatch: majorDraftNext,
    });
    await addLog(selectedTopicId, {
      date: todayKey,
      text,
      type: "major",
    });
    setMajorInputMode(false);
    setMajorDraftChange("");
    setMajorDraftMoment("");
    setMajorDraftNext("");
    debugLog("major:saved", { topicId: selectedTopicId, date: todayKey });
  }, [
    selectedTopicId,
    selectedTopic,
    todayKey,
    majorDraftChange,
    majorDraftMoment,
    majorDraftNext,
    majorSaveDisabled,
    addLog,
  ]);

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
      console.log("[handlePatch] 조기 종료: 이미 해당 날짜 Patch 있음", {
        todayKey,
      });
      return;
    }
    const entry: LogInput = {
      date: todayKey,
      text: selectedTopic.title,
      type: "patch",
    };
    const nextStreak = computeStreak([
      ...patchLogs.map((l) => l.date),
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
    patchLogs,
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
    const entry: LogInput = { date: todayKey, text, type: "patch" };
    const nextStreak = computeStreak([
      ...patchLogs.map((l) => l.date),
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
    patchLogs,
    todayKey,
    editPatchText,
    addLog,
    showPatchSuccessFeedback,
  ]);

  const openEditPatch = useCallback(() => {
    if (!selectedTopic) return;
    const newest = sortLogsNewestFirst(patchLogs)[0];
    setEditPatchText(newest?.text || selectedTopic.title);
    setEditPatchOpen(true);
  }, [selectedTopic, patchLogs]);

  return {
    todayKey,
    selectedTopic,
    /** 선택 Topic 전체 로그 */
    logs: topicLogs,
    patchCount,
    streak,
    sortedLogs,
    referenceLogsPatchMinor,
    latestNextPatchDirection,
    canStartMajor,
    showMajorTimingMessage,
    showMinorFork,
    minorInputMode,
    minorDraftText,
    setMinorDraftText,
    handleContinueRecording,
    handleOpenMinorInput,
    handleCancelMinor,
    handleSaveMinor,
    majorInputMode,
    majorDraftChange,
    setMajorDraftChange,
    majorDraftMoment,
    setMajorDraftMoment,
    majorDraftNext,
    setMajorDraftNext,
    handleOpenMajorComposer,
    handleCancelMajor,
    handleSaveMajor,
    majorSaveDisabled,
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
