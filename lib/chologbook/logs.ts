import type { Log } from "./types";
import { newLogId } from "@/lib/chologbook/id";

/** 특정 Topic에 속한 로그만 (전역 `logs`에서 필터) */
export function getLogsByTopic(logs: Log[], topicId: string): Log[] {
  return logs.filter((l) => l.topicId === topicId);
}

/** 날짜·텍스트만 있는 입력 → 전역 Log 엔트리 (id·userId 부여) */
export function stampLog(
  userId: string,
  topicId: string,
  entry: { date: string; text: string },
): Log {
  return {
    id: newLogId(),
    userId,
    topicId,
    date: entry.date,
    text: entry.text,
  };
}
