/** 토픽 전체 Patch 개수를 짧은 한국어 문장으로 */
export function patchTotalSummarySentence(count: number): string {
  if (count <= 0) return "아직 남긴 Patch가 없어요.";
  if (count === 1) return "지금까지 Patch를 한 번 남겼어요.";
  return `지금까지 Patch를 ${count}번 남겼어요.`;
}
