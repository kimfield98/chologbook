"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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

  /** 시간순 정렬 — Major 구간 경계(lastMajorIndex) 계산용 */
  const topicLogsSorted = useMemo(
    () => sortLogsOldestFirst(topicLogs),
    [topicLogs],
  );

  /** 가장 마지막 Major의 인덱스(없으면 -1). topicLogsSorted 기준 */
  const lastMajorIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < topicLogsSorted.length; i += 1) {
      if (getLogType(topicLogsSorted[i]!) === "major") idx = i;
    }
    return idx;
  }, [topicLogsSorted]);

  /** 마지막 Major 이후만 "현재 구간" UI 판단에 사용 */
  const currentLogs = useMemo(() => {
    if (lastMajorIndex === -1) return topicLogsSorted;
    return topicLogsSorted.slice(lastMajorIndex + 1);
  }, [topicLogsSorted, lastMajorIndex]);

  const patchLogs = useMemo(
    () => currentLogs.filter((l) => getLogType(l) === "patch"),
    [currentLogs],
  );

  const totalPatchCount = useMemo(
    () => topicLogs.filter((l) => getLogType(l) === "patch").length,
    [topicLogs],
  );

  const minorLogs = useMemo(
    () => currentLogs.filter((l) => getLogType(l) === "minor"),
    [currentLogs],
  );

  const patchCount = patchLogs.length;
  const minorCount = minorLogs.length;

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

  /** 구간이 바뀌면(새 Major 직후 등) Minor 분기 dismiss 초기화 */
  useEffect(() => {
    setMinorForkDismissed(false);
  }, [lastMajorIndex]);

  /** Patch / Minor / Major 시간순 — 전체 토픽(저장 데이터 그대로 표시) */
  const sortedLogs = useMemo(
    () => sortLogsOldestFirst(topicLogs),
    [topicLogs],
  );

  /** Major 작성 시 참고: 현재 구간의 Patch·Minor만 */
  const referenceLogsPatchMinor = useMemo(
    () =>
      sortLogsOldestFirst(
        currentLogs.filter(
          (l) => getLogType(l) === "patch" || getLogType(l) === "minor",
        ),
      ),
    [currentLogs],
  );

  /** 전체 토픽 기준 가장 최근 Major → 다음 Patch 방향(상단 안내) */
  const latestNextPatchDirection = useMemo(() => {
    if (lastMajorIndex < 0) return "";
    const row = topicLogsSorted[lastMajorIndex];
    if (!row?.text) return "";
    return extractNextPatchDirectionFromMajor(row.text).trim();
  }, [lastMajorIndex, topicLogsSorted]);

  const canStartMajor = minorCount >= 2;

  /** Minor ≥ 2일 때 Major CTA (현재 구간 기준) */
  const showMajorCTA = canStartMajor && !majorInputMode;
  const showMajorTimingMessage = showMajorCTA;

  const showMinorFork =
    patchCount >= PATCH_COUNT_FOR_MINOR_FORK &&
    !minorInputMode &&
    !minorForkDismissed &&
    !majorInputMode;

  const alreadyPatchedToday = useMemo(
    () => todayKey !== "" && hasLogForDate(currentLogs, todayKey),
    [todayKey, currentLogs],
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

  const showPatchSuccessFeedback = useCallback((nextTotalPatchCount: number) => {
    if (feedbackClearRef.current) clearTimeout(feedbackClearRef.current);
    const msg =
      nextTotalPatchCount === 1
        ? "첫 Patch를 남겼어요"
        : "오늘 기록을 남겼어요";
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
      currentLogsLen: currentLogs.length,
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
    if (hasLogForDate(currentLogs, todayKey)) {
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
    /** 토픽 전체 누적 기준(구간과 무관) — 저장 직후 피드백 문구용 */
    const nextTotalPatchCount = totalPatchCount + 1;
    await addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextTotalPatchCount);
    debugLog("patch:quick", {
      topicId: selectedTopicId,
      entry,
      nextTotalPatchCount,
    });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    currentLogs,
    todayKey,
    totalPatchCount,
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
    if (hasLogForDate(currentLogs, todayKey)) {
      console.log("[handleSaveEditPatch] 조기 종료: 중복 날짜");
      return;
    }
    const text = editPatchText.trim() || selectedTopic.title;
    const entry: LogInput = { date: todayKey, text, type: "patch" };
    const nextTotalPatchCount = totalPatchCount + 1;
    await addLog(selectedTopicId, entry);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextTotalPatchCount);
    debugLog("patch:edit", {
      topicId: selectedTopicId,
      entry,
      nextTotalPatchCount,
    });
  }, [
    selectedTopicId,
    selectedTopic,
    patchDisabled,
    currentLogs,
    todayKey,
    totalPatchCount,
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
    totalPatchCount,
    minorCount,
    sortedLogs,
    referenceLogsPatchMinor,
    latestNextPatchDirection,
    canStartMajor,
    showMajorCTA,
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
