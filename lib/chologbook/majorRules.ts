import { getLogType } from "@/lib/chologbook/logs";
import type { Log } from "@/lib/chologbook/types";

/** 현재 구간에서 Major를 쓰기 위해 필요한 Minor 개수 */
export const MINOR_COUNT_FOR_MAJOR = 2;

/** 마지막 Major 이후 구간에 쌓인 Minor 개수(usePatch `minorCount`와 동일 기준) */
export function countMinorsSinceLastMajor(sortedLogs: Log[]): number {
  let lastMajor = -1;
  for (let i = 0; i < sortedLogs.length; i += 1) {
    if (getLogType(sortedLogs[i]!) === "major") lastMajor = i;
  }
  const segment =
    lastMajor === -1 ? sortedLogs : sortedLogs.slice(lastMajor + 1);
  return segment.filter((l) => getLogType(l) === "minor").length;
}

export type MajorAvailability = {
  canOpen: boolean;
  hint: string;
  progressLabel: string;
};

export function describeMajorAvailability(input: {
  todayKey: string;
  minorCount: number;
}): MajorAvailability {
  const need = MINOR_COUNT_FOR_MAJOR;
  const progressLabel = `${Math.min(input.minorCount, need)}/${need}`;

  if (!input.todayKey) {
    return {
      canOpen: false,
      hint: "날짜를 불러오는 중이에요.",
      progressLabel,
    };
  }

  const minorsOk = input.minorCount >= need;

  const hint = minorsOk
    ? "지금 이 흐름을 정리해볼까요?"
    : "조금 더 쌓이면 정리할 수 있어요.";

  return {
    canOpen: minorsOk,
    hint,
    progressLabel,
  };
}

/** Major CTA 한 줄 — 잠금 시 `Minor 기록이 N개 더 필요해요` */
export function formatMajorButtonLabel(input: {
  todayKey: string;
  canWrite: boolean;
  canStartMajor: boolean;
  minorCountInSegment: number;
  hasSelectedTopic: boolean;
}): string {
  if (!input.canWrite) return "로그인 후 작성할 수 있어요";
  if (!input.todayKey) return "날짜 불러오는 중…";
  if (!input.hasSelectedTopic) return "초록북을 선택해 주세요";
  if (input.canStartMajor) return "지금 기록하기";
  const need = MINOR_COUNT_FOR_MAJOR;
  const remaining = Math.max(0, need - input.minorCountInSegment);
  if (remaining > 0) return `Minor 기록이 ${remaining}개 더 필요해요`;
  return "지금 기록하기";
}
