import { newLogId } from "@/lib/chologbook/id";
import type { Log, Topic } from "@/lib/chologbook/types";

/** 예전: Topic 안에 logs[] — 전역 Log[] + Topic(그룹만)으로 변환 */
type LegacyTopic = {
  id: string;
  title: string;
  logs: { date: string; text: string }[];
};

export function migrateEmbeddedLogsToGlobal(
  legacyTopics: LegacyTopic[],
): { topics: Topic[]; logs: Log[] } {
  const topics: Topic[] = legacyTopics.map(({ id, title }) => ({ id, title }));
  const logs: Log[] = [];
  for (const t of legacyTopics) {
    for (const row of t.logs) {
      logs.push({
        id: newLogId(),
        topicId: t.id,
        date: row.date,
        text: row.text,
      });
    }
  }
  return { topics, logs };
}

/** 앱 기본 시드 (과거 embedded 형태로 적어 두고 마이그레이션 한 번에 반영) */
const LEGACY_SEED: LegacyTopic[] = [
  { id: "1", title: "경제책 읽기", logs: [] },
];

export const { topics: INITIAL_TOPICS, logs: INITIAL_LOGS } =
  migrateEmbeddedLogsToGlobal(LEGACY_SEED);
