import { getLogsByTopic } from "@/lib/chologbook/logs";
import type { Log, Topic } from "@/lib/chologbook/types";

/** 해당 토픽의 가장 이른 날짜 로그 텍스트를 제목 후보로 쓴다(첫 Patch가 보통 topic.title과 동일). */
function inferTitleFromLogs(logsForTopic: Log[]): string {
  if (logsForTopic.length === 0) return "기록";
  const sorted = [...logsForTopic].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.id.localeCompare(b.id);
  });
  const t = sorted[0]?.text?.trim();
  return t ? t : "기록";
}

/**
 * Firestore에서 온 Topic과, 로그에만 존재하는 topicId(레거시·미동기화)를 합친다.
 * 둘 다 비었을 때만 seed(초기 시드 토픽)를 쓴다.
 */
export function mergeRemoteTopicsWithLogs(
  remote: Topic[],
  logs: Log[],
  seedWhenEmpty: Topic[],
): Topic[] {
  const map = new Map<string, Topic>();
  for (const t of remote) {
    map.set(t.id, t);
  }
  const idsInLogs = new Set(
    logs.map((l) => l.topicId).filter((id): id is string => Boolean(id?.trim())),
  );
  for (const topicId of idsInLogs) {
    if (map.has(topicId)) continue;
    const forTopic = getLogsByTopic(logs, topicId);
    map.set(topicId, { id: topicId, title: inferTitleFromLogs(forTopic) });
  }
  const merged = [...map.values()];
  if (merged.length === 0) {
    return [...seedWhenEmpty];
  }
  return merged;
}
