/**
 * 홈 리스트의 "🌱 현재 집중"·강조 스타일에 쓰는 Topic id.
 * - 상세: selectedTopicId가 곧 화면·집중과 일치
 * - 홈: selectedTopicId는 null → 마지막으로 연 상세 Topic(lastFocusTopicId)로 맥락 유지
 */
export function getFocusTopicId(
  selectedTopicId: string | null,
  lastFocusTopicId: string | null,
): string | undefined {
  return selectedTopicId ?? lastFocusTopicId ?? undefined;
}
