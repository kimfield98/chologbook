/** Topic id — 클라이언트 전용 생성, UUID 우선 (충돌·예측 가능성 완화) */
export function newTopicId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `topic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
