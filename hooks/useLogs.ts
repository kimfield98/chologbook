"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addLogToFirestore,
  clearLogsByTopic as clearLogsByTopicInFirestore,
  getLogsFromFirestore,
} from "@/lib/chologbook/firestoreLogs";
import { getLogType, getLogsByTopic, stampLog } from "@/lib/chologbook/logs";
import type { Log, LogType } from "@/lib/chologbook/types";
import { initFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { debugLog } from "@/lib/debugLog";

export type LogInput = { date: string; text: string; type?: LogType };

type UseLogsOptions = {
  /** 익명 Auth uid — 없으면 Firestore 미사용·로그 생성 불가 */
  userId: string | undefined;
};

/**
 * 전역 Log 목록 — userId 단위로 Firestore와만 동기화한다.
 */
export function useLogs({ userId }: UseLogsOptions) {
  const [logs, setLogs] = useState<Log[]>([]);
  /** addLog에서 최신 배열 기준 중복 검사용 (setState 외부에서 prev 접근) */
  const logsRef = useRef<Log[]>(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  /** userId 없음 → 로컬 비우고 Firestore 호출 안 함 */
  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setLogs([]);
        logsRef.current = [];
      });
      debugLog("useLogs: userId 없음 — logs 비움, Firestore 스킵");
      return;
    }

    if (!isFirebaseConfigured()) {
      queueMicrotask(() => {
        setLogs([]);
        logsRef.current = [];
      });
      debugLog("useLogs: Firebase env 없음 — Firestore 스킵");
      return;
    }

    initFirebase();

    void (async () => {
      try {
        console.log("[useLogs] Firestore 로드 userId", userId);
        const remote = await getLogsFromFirestore(userId);
        setLogs(remote);
        logsRef.current = remote;
        debugLog("useLogs: Firestore에서 로드", {
          userId,
          count: remote.length,
        });
      } catch (e) {
        console.error("[useLogs] Firestore 로드 실패", e);
        setLogs([]);
        logsRef.current = [];
      }
    })();
  }, [userId]);

  /**
   * 로그 1건 추가: newLog는 setState 밖에서 생성하고, Firestore는 그 인스턴스로만 동기화.
   */
  const addLog = useCallback(
    async (topicId: string, entry: LogInput) => {
      console.log("[addLog] 호출됨", { topicId, entry, userId });

      if (!userId?.trim()) {
        console.warn("[useLogs:addLog] userId 없음 — 생성·저장 금지");
        return;
      }

      const prev = logsRef.current;
      const forTopic = getLogsByTopic(prev, topicId);
      const entryType: LogType = entry.type ?? "patch";
      if (
        entryType === "patch" &&
        forTopic.some(
          (l) => getLogType(l) === "patch" && l.date === entry.date,
        )
      ) {
        console.log("[useLogs:addLog] Patch 중복 날짜 — 스킵", {
          topicId,
          date: entry.date,
        });
        return;
      }

      const newLog = stampLog(userId, topicId, entry);
      console.log("[useLogs:addLog] newLog 생성됨", newLog);

      setLogs((p) => {
        const ft = getLogsByTopic(p, topicId);
        if (
          entryType === "patch" &&
          ft.some((l) => getLogType(l) === "patch" && l.date === entry.date)
        ) {
          return p;
        }
        return [...p, newLog];
      });

      logsRef.current = [...prev, newLog];

      if (!isFirebaseConfigured()) {
        console.log("[useLogs:addLog] Firebase 미설정 — Firestore 스킵");
        return;
      }

      try {
        initFirebase();
        console.log("[useLogs:addLog] addLogToFirestore 호출", newLog.id);
        await addLogToFirestore(newLog);
        console.log("[useLogs:addLog] Firestore 저장 완료", newLog.id);
        debugLog("useLogs: Firestore 저장 완료", { id: newLog.id });
      } catch (e) {
        console.error("[useLogs] addLog Firestore 저장 실패", e);
      }
    },
    [userId],
  );

  const clearLogsForTopic = useCallback(
    (topicId: string) => {
      if (!userId?.trim()) {
        console.warn("[useLogs:clearLogsForTopic] userId 없음 — 스킵");
        return;
      }

      setLogs((prev) => prev.filter((l) => l.topicId !== topicId));

      if (!isFirebaseConfigured()) return;

      void (async () => {
        try {
          initFirebase();
          await clearLogsByTopicInFirestore(userId, topicId);
          debugLog("useLogs: Firestore topic 로그 삭제", { userId, topicId });
        } catch (e) {
          console.error("[useLogs] clearLogs Firestore 실패", e);
        }
      })();
    },
    [userId],
  );

  const replaceLogsForTopic = useCallback(
    (topicId: string, entries: LogInput[]) => {
      if (!userId?.trim()) {
        console.warn("[useLogs:replaceLogsForTopic] userId 없음 — 스킵");
        return;
      }

      const added = entries.map((e) => stampLog(userId, topicId, e));
      setLogs((prev) => [...prev.filter((l) => l.topicId !== topicId), ...added]);
      logsRef.current = [
        ...logsRef.current.filter((l) => l.topicId !== topicId),
        ...added,
      ];

      if (!isFirebaseConfigured()) return;

      void (async () => {
        try {
          initFirebase();
          await clearLogsByTopicInFirestore(userId, topicId);
          for (const log of added) {
            await addLogToFirestore(log);
          }
          debugLog("useLogs: Firestore replace 완료", {
            userId,
            topicId,
            count: added.length,
          });
        } catch (e) {
          console.error("[useLogs] replaceLogs Firestore 실패", e);
        }
      })();
    },
    [userId],
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
