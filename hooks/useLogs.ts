"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addLogToFirestore,
  clearLogsByTopic as clearLogsByTopicInFirestore,
  getLogsFromFirestore,
} from "@/lib/chologbook/firestoreLogs";
import { getLogsByTopic, stampLog } from "@/lib/chologbook/logs";
import { INITIAL_LOGS } from "@/lib/chologbook/migrate";
import type { Log } from "@/lib/chologbook/types";
import { initFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { debugLog } from "@/lib/debugLog";

export type LogInput = { date: string; text: string };

/**
 * 전역 Log 목록 — 로컬 state가 기본이며, Firestore는 추가 저장소로 동기화한다.
 */
export function useLogs() {
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);
  /** addLog에서 최신 배열 기준 중복 검사용 (setState 외부에서 prev 접근) */
  const logsRef = useRef<Log[]>(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  /** 앱 시작 시 Firestore에서 로그 병합(추가 저장소) */
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      debugLog("useLogs: Firebase env 없음 — Firestore 스킵");
      return;
    }

    initFirebase();

    void (async () => {
      try {
        const remote = await getLogsFromFirestore();
        setLogs(remote);
        debugLog("useLogs: Firestore에서 로드", { count: remote.length });
      } catch (e) {
        console.error("[useLogs] Firestore 로드 실패 — 로컬 시드 유지", e);
      }
    })();
  }, []);

  /**
   * 로그 1건 추가: newLog는 setState 밖에서 생성하고, Firestore는 그 인스턴스로만 동기화.
   * (업데이터 안에서 `let added`에 대입 후 바깥에서 읽는 패턴은 배치/Strict Mode에서 실패할 수 있음)
   */
  const addLog = useCallback(async (topicId: string, entry: LogInput) => {
    // production에서도 추적 가능하도록 항상 출력 (원인 분석용)
    console.log("[addLog] 호출됨", { topicId, entry });

    const prev = logsRef.current;
    const forTopic = getLogsByTopic(prev, topicId);
    if (forTopic.some((l) => l.date === entry.date)) {
      console.log("[useLogs:addLog] 중복 날짜 — 스킵", {
        topicId,
        date: entry.date,
      });
      return;
    }

    const newLog = stampLog(topicId, entry);
    console.log("[useLogs:addLog] newLog 생성됨", newLog);

    setLogs((p) => {
      const ft = getLogsByTopic(p, topicId);
      if (ft.some((l) => l.date === entry.date)) return p;
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
  }, []);

  const clearLogsForTopic = useCallback((topicId: string) => {
    setLogs((prev) => prev.filter((l) => l.topicId !== topicId));

    if (!isFirebaseConfigured()) return;

    void (async () => {
      try {
        initFirebase();
        await clearLogsByTopicInFirestore(topicId);
        debugLog("useLogs: Firestore topic 로그 삭제", { topicId });
      } catch (e) {
        console.error("[useLogs] clearLogs Firestore 실패", e);
      }
    })();
  }, []);

  const replaceLogsForTopic = useCallback(
    (topicId: string, entries: LogInput[]) => {
      const added = entries.map((e) => stampLog(topicId, e));
      setLogs((prev) => [...prev.filter((l) => l.topicId !== topicId), ...added]);

      if (!isFirebaseConfigured()) return;

      void (async () => {
        try {
          initFirebase();
          await clearLogsByTopicInFirestore(topicId);
          for (const log of added) {
            await addLogToFirestore(log);
          }
          debugLog("useLogs: Firestore replace 완료", {
            topicId,
            count: added.length,
          });
        } catch (e) {
          console.error("[useLogs] replaceLogs Firestore 실패", e);
        }
      })();
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
