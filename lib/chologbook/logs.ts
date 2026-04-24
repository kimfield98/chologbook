import type { Log, LogType } from "./types";
import { newLogId } from "@/lib/chologbook/id";

/** `type` 생략·레거시 문서는 Patch로 간주 */
export function getLogType(log: Log): LogType {
  if (log.type === "minor") return "minor";
  if (log.type === "major") return "major";
  return "patch";
}

/** 특정 Topic에 속한 로그만 (전역 `logs`에서 필터) */
export function getLogsByTopic(logs: Log[], topicId: string): Log[] {
  return logs.filter((l) => l.topicId === topicId);
}

/** 날짜·텍스트·type 입력 → 전역 Log 엔트리 (id·userId 부여) */
export function stampLog(
  userId: string,
  topicId: string,
  entry: { date: string; text: string; type?: LogType },
): Log {
  const type: LogType = entry.type ?? "patch";
  return {
    id: newLogId(),
    userId,
    topicId,
    date: entry.date,
    text: entry.text,
    type,
  };
}
