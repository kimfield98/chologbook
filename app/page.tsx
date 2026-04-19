"use client";

import { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// 날짜 유틸 (모든 날짜는 YYYY-MM-DD 문자열로 다룸, 표시·저장·비교에 동일 규칙 적용)
// -----------------------------------------------------------------------------

/** 로컬 타임존 기준으로 Date → YYYY-MM-DD */
function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD → 로컬 자정 기준 Date (파싱 오류 시 Invalid Date 가능) */
function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Streak: 가장 최근 기록일부터 하루씩 거슬러 올라가며
 * 빠짐없이 이어진 연속 일수 (Patch가 있는 날만 카운트)
 */
function computeStreak(logs: string[]): number {
  const unique = [...new Set(logs)].filter(Boolean).sort();
  if (unique.length === 0) return 0;

  const daySet = new Set(unique);
  const latest = unique[unique.length - 1]!;
  let streak = 0;
  const cursor = parseYmd(latest);

  while (daySet.has(formatYmd(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** 로그 배열을 최신순(내림차순)으로 정렬해 반환 */
function sortLogsNewestFirst(logs: string[]): string[] {
  return [...new Set(logs)].filter(Boolean).sort().reverse();
}

// -----------------------------------------------------------------------------
// 페이지: 단일 Topic MVP — Patch / Streak / Logs
// -----------------------------------------------------------------------------

export default function Home() {
  /** 연속 기록 일수 */
  const [streak, setStreak] = useState(0);
  /** Patch 기록 날짜 목록 (YYYY-MM-DD) */
  const [logs, setLogs] = useState<string[]>([]);
  /** 마지막으로 Patch한 날짜 (오늘 기록 여부 판단에도 활용) */
  const [lastCheckedDate, setLastCheckedDate] = useState("");

  /**
   * 오늘 날짜 키 — 클라이언트 마운트 후에만 채움
   * (SSR 시점의 서버 날짜와 사용자 로컬 날짜 불일치·하이드레이션 이슈 방지)
   */
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    // 클라이언트 로컬 날짜 확정 — effect 직후 동기 setState 린트 회피를 위해 마이크로태스크로 지연
    queueMicrotask(() => {
      setTodayKey(formatYmd(new Date()));
    });
  }, []);

  const topicTitle = "경제책 읽기";
  const logCount = new Set(logs).size;
  /** 오늘 Patch 여부: 로그 + lastCheckedDate(확장·동기화용) */
  const alreadyPatchedToday =
    todayKey !== "" &&
    (logs.includes(todayKey) || lastCheckedDate === todayKey);
  const patchDisabled = todayKey === "" || alreadyPatchedToday;

  /** 오늘 Patch 1회 — 하루 1회만, 입력 없이 즉시 반영 */
  function handlePatch() {
    if (patchDisabled) return;

    const nextLogs = [...logs, todayKey];
    setLogs(nextLogs);
    setStreak(computeStreak(nextLogs));
    setLastCheckedDate(todayKey);
  }

  const sortedLogs = sortLogsNewestFirst(logs);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      <main className="w-full max-w-md">
        {/* TopicCard: 하나의 바구니(Topic) UI */}
        <section
          className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100"
          aria-labelledby="topic-title"
        >
          <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
            CHOLOGBOOK · Patch
          </p>
          <h1
            id="topic-title"
            className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900"
          >
            {topicTitle}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-orange-800 ring-1 ring-orange-100"
              title="연속 기록 일수"
            >
              <span aria-hidden>🔥</span>
              <span className="font-medium text-orange-900">
                {streak}일
              </span>
              <span className="text-orange-700/90">유지 중</span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-900 ring-1 ring-emerald-100"
              title="누적 Patch 수"
            >
              <span aria-hidden>🧺</span>
              <span className="font-medium">{logCount}개</span>
            </span>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handlePatch}
              disabled={patchDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
            >
              <span aria-hidden>✔</span>
              {alreadyPatchedToday
                ? "오늘은 이미 기록했어요"
                : "오늘도 했어요"}
            </button>
            {todayKey === "" ? (
              <p className="mt-2 text-center text-xs text-zinc-400">
                날짜 정보를 불러오는 중…
              </p>
            ) : null}
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-5">
            <h2 className="text-sm font-semibold text-zinc-800">로그</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              최신순 · YYYY-MM-DD
            </p>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
              {sortedLogs.length === 0 ? (
                <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-zinc-500">
                  아직 기록이 없어요. 위 버튼으로 오늘의 Patch를 남겨보세요.
                </li>
              ) : (
                sortedLogs.map((date) => (
                  <li
                    key={date}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-zinc-800"
                  >
                    <span className="font-mono text-[13px]">{date}</span>
                    <span className="text-emerald-600" aria-label="기록됨">
                      ✔
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
