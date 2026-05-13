const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  economy: "경제",
  work: "일&커리어",
  development: "개발",
  life: "일상",
};

export function normalizeMemoTag(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return LEGACY_CATEGORY_LABELS[trimmed] ?? trimmed;
}

export function displayMemoTag(raw: string | undefined): string {
  if (!raw) return "";
  return normalizeMemoTag(raw);
}

export function memoTagSearchKey(tag: string): string {
  return normalizeMemoTag(tag).toLocaleLowerCase("ko-KR");
}

export function matchesMemoTagFilter(memoTag: string, selectedTag: string): boolean {
  return memoTagSearchKey(memoTag) === memoTagSearchKey(selectedTag);
}
