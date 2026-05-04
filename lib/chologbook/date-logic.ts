import type { Log } from "./types";

/** 로컬 타임존 기준으로 Date → YYYY-MM-DD */
export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 로그를 날짜 기준 최신순(내림차순)으로 정렬 */
export function sortLogsNewestFirst(logs: Log[]): Log[] {
  return [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.id.localeCompare(b.id);
  });
}

/** 로그를 날짜·id 기준 시간순(오래된 것 → 최신) */
export function sortLogsOldestFirst(logs: Log[]): Log[] {
  return [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.id.localeCompare(b.id);
  });
}

/** 해당 날짜에 Patch가 이미 있는지 (하루 1 Patch 제한용) */
export function hasLogForDate(topicLogs: Log[], date: string): boolean {
  return topicLogs.some(
    (l) => (l.type ?? "patch") === "patch" && l.date === date,
  );
}

/** 해당 날짜에 Minor가 이미 있는지 (토픽당 하루 1 Minor 제한용) */
export function hasMinorForDate(topicLogs: Log[], date: string): boolean {
  return topicLogs.some((l) => l.type === "minor" && l.date === date);
}
