import type { Log } from "./types";

/** 로컬 타임존 기준으로 Date → YYYY-MM-DD */
export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD → 로컬 자정 기준 Date */
export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Streak: 가장 최근 기록일부터 하루씩 거슬러 올라가며
 * 연속으로 Patch가 있는 날만 카운트
 */
export function computeStreak(dates: string[]): number {
  const unique = [...new Set(dates)].filter(Boolean).sort();
  if (unique.length === 0) return 0;

  const daySet = new Set(unique);
  const latest = unique[unique.length - 1]!;
  let streak = 0;
  const cursor = parseYmd(latest);

  while (daySet.has(formatYmd(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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
