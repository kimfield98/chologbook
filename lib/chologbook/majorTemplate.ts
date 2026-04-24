/** Major 본문에 섹션 구분용(저장은 text 한 필드, 파싱용 마커) */
export const MAJOR_SECTION_CHANGE = "━━━ 이 구간에서 달라진 점 ━━━\n";
export const MAJOR_SECTION_MOMENT = "━━━ 가장 기억에 남는 순간 ━━━\n";
export const MAJOR_SECTION_NEXT = "━━━ 다음 Patch 방향 ━━━\n";

export type MajorTemplateParts = {
  change: string;
  moment: string;
  nextPatch: string;
};

/** 템플릿 3구역을 하나의 text로 합친다(별도 필드 없음). */
export function buildMajorText(parts: MajorTemplateParts): string {
  const c = parts.change.trim() || "(작성 없음)";
  const m = parts.moment.trim() || "(작성 없음)";
  const n = parts.nextPatch.trim() || "(작성 없음)";
  return `${MAJOR_SECTION_CHANGE}${c}\n\n${MAJOR_SECTION_MOMENT}${m}\n\n${MAJOR_SECTION_NEXT}${n}`;
}

/** 저장된 Major text에서 「다음 Patch 방향」 블록만 추출(상단 안내용). */
export function extractNextPatchDirectionFromMajor(full: string): string {
  const idx = full.indexOf(MAJOR_SECTION_NEXT);
  if (idx === -1) return "";
  return full.slice(idx + MAJOR_SECTION_NEXT.length).trim();
}
