/** 현재 구간에서 Major를 쓰기 위해 필요한 Minor 개수 */
export const MINOR_COUNT_FOR_MAJOR = 2;

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
