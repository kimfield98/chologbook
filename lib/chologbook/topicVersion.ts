import { getLogType } from "@/lib/chologbook/logs";
import type { Log } from "@/lib/chologbook/types";

export type TopicVersionCounts = {
  major: number;
  minor: number;
  patch: number;
};

export function countTopicVersion(logs: Log[]): TopicVersionCounts {
  let major = 0;
  let minor = 0;
  let patch = 0;

  for (const l of logs) {
    const t = getLogType(l);
    if (t === "major") major += 1;
    else if (t === "minor") minor += 1;
    else if (t === "patch") patch += 1;
  }

  return { major, minor, patch };
}

/** 토픽 누적을 버전 문자열로 (vMajor.Minor.Patch) */
export function topicVersionLabelFromLogs(logs: Log[]): string {
  const c = countTopicVersion(logs);
  return `v${c.major}.${c.minor}.${c.patch}`;
}

