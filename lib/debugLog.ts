/** 개발 환경에서만 구조화된 디버그 출력 */
export function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log("[chologbook]", ...args);
  }
}
