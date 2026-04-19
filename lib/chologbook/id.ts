function randomId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Topic id — 클라이언트 전용 생성, UUID 우선 */
export function newTopicId(): string {
  return randomId("topic");
}

/** Log id — Topic과 동일하게 UUID 우선 */
export function newLogId(): string {
  return randomId("log");
}
