"use client";

import { useEffect, useRef, useState } from "react";

/** Patch 한 건 (날짜 + 사용자 표현 텍스트) */
type Log = {
  date: string;
  text: string;
};

/** 하나의 Topic (바구니) */
type Topic = {
  id: string;
  title: string;
  logs: Log[];
};

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
 * — dates는 Log에서 추출한 YYYY-MM-DD 목록
 */
function computeStreak(dates: string[]): number {
  const unique = [...new Set(dates)].filter(Boolean).sort();
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

/** 로그를 날짜 기준 최신순(내림차순)으로 정렬해 반환 */
function sortLogsNewestFirst(logs: Log[]): Log[] {
  return [...logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// -----------------------------------------------------------------------------
// 페이지: 멀티 Topic — 홈 / 상세(Patch·Streak·Logs) + 테스트 모드
// -----------------------------------------------------------------------------

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "경제책 읽기", logs: [] },
  ]);
  /** null이면 홈, 값이면 해당 Topic 상세 */
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  /** 테스트 UI·동작 게이트 */
  const [isTestMode, setIsTestMode] = useState(true);
  /** 우측 하단 테스트 패널 열림 */
  const [testPanelOpen, setTestPanelOpen] = useState(false);

  /** "✍️ 수정해서 기록" 편집 영역 표시 여부 */
  const [editPatchOpen, setEditPatchOpen] = useState(false);
  /** 수정 Patch 입력 초안 */
  const [editPatchText, setEditPatchText] = useState("");

  /** Patch 성공 짧은 피드백 (1~2초 후 자동 숨김) */
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const feedbackClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 오늘 날짜 키 — 클라이언트 마운트 후에만 채움
   * (SSR 시점의 서버 날짜와 사용자 로컬 날짜 불일치·하이드레이션 이슈 방지)
   */
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setTodayKey(formatYmd(new Date()));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackClearRef.current) clearTimeout(feedbackClearRef.current);
    };
  }, []);

  /** Topic 전환 시 편집·피드백 정리 (동기 setState 린트 회피: 마이크로태스크로 지연) */
  useEffect(() => {
    queueMicrotask(() => {
      setEditPatchOpen(false);
      setFeedbackMessage("");
      if (feedbackClearRef.current) {
        clearTimeout(feedbackClearRef.current);
        feedbackClearRef.current = null;
      }
    });
  }, [selectedTopicId]);

  const selectedTopic =
    selectedTopicId === null
      ? undefined
      : topics.find((t) => t.id === selectedTopicId);

  const logs = selectedTopic?.logs ?? [];
  const streak = computeStreak(logs.map((l) => l.date));

  /** Patch 저장 직후 짧은 문구 표시 (연속일이면 🔥, 아니면 ✔) */
  function showPatchSuccessFeedback(nextStreak: number) {
    if (feedbackClearRef.current) clearTimeout(feedbackClearRef.current);
    const msg =
      nextStreak >= 2 ? "🔥 흐름 이어가는 중" : "✔ 잘 쌓이고 있어요";
    setFeedbackMessage(msg);
    feedbackClearRef.current = setTimeout(() => {
      setFeedbackMessage("");
      feedbackClearRef.current = null;
    }, 1800);
  }

  /** 해당 Topic·날짜에 이미 기록이 있는지 (하루 1회 · 중복 방지) */
  function hasLogForDate(topicLogs: Log[], date: string): boolean {
    return topicLogs.some((l) => l.date === date);
  }

  /** 오늘 Patch 여부 (해당 Topic logs 기준) */
  const alreadyPatchedToday =
    todayKey !== "" && hasLogForDate(logs, todayKey);
  const patchDisabled = todayKey === "" || alreadyPatchedToday || !selectedTopicId;

  /** 특정 Topic의 logs만 갱신 */
  function updateTopicLogs(topicId: string, nextLogs: Log[]) {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, logs: nextLogs } : t)),
    );
  }

  /** 빠른 Patch — topic.title을 text로 저장, 같은 날짜 중복 불가 */
  function handlePatch() {
    if (!selectedTopicId || !selectedTopic) return;
    if (patchDisabled) return;
    if (hasLogForDate(logs, todayKey)) return;

    const nextLogs = [...logs, { date: todayKey, text: selectedTopic.title }];
    const nextStreak = computeStreak(nextLogs.map((l) => l.date));
    updateTopicLogs(selectedTopicId, nextLogs);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
  }

  /** 수정 Patch 저장 — 입력 텍스트, 같은 날짜 중복 불가 */
  function handleSaveEditPatch() {
    if (!selectedTopicId || !selectedTopic) return;
    if (patchDisabled) return;
    if (hasLogForDate(logs, todayKey)) return;

    const text = editPatchText.trim() || selectedTopic.title;
    const nextLogs = [...logs, { date: todayKey, text }];
    const nextStreak = computeStreak(nextLogs.map((l) => l.date));
    updateTopicLogs(selectedTopicId, nextLogs);
    setEditPatchOpen(false);
    showPatchSuccessFeedback(nextStreak);
  }

  /** 수정 기록 UI 열기 — 마지막 로그 text 없으면 topic.title */
  function openEditPatch() {
    if (!selectedTopic) return;
    const lastLog = logs[logs.length - 1];
    setEditPatchText(lastLog?.text || selectedTopic.title);
    setEditPatchOpen(true);
  }

  /** [+ 하루 추가] 오늘 기준으로 아직 없는 가장 가까운 과거일 1건 추가 */
  function testAddPastDay() {
    if (!selectedTopicId || !selectedTopic || !todayKey) return;
    const existing = new Set(selectedTopic.logs.map((l) => l.date));
    for (let k = 1; k < 400; k += 1) {
      const d = new Date();
      d.setDate(d.getDate() - k);
      const key = formatYmd(d);
      if (!existing.has(key)) {
        const nextLogs = [
          ...selectedTopic.logs,
          { date: key, text: `${selectedTopic.title} (테스트 -${k}일)` },
        ];
        updateTopicLogs(selectedTopicId, nextLogs);
        return;
      }
    }
  }

  /** [💭 Minor 테스트] logs가 3개 이상이 되도록 과거일 위주로 보강 */
  function testForceMinor() {
    if (!selectedTopicId || !selectedTopic) return;
    const next = [...selectedTopic.logs];
    const existingDates = new Set(next.map((l) => l.date));
    for (let k = 1; next.length < 3 && k < 400; k += 1) {
      const d = new Date();
      d.setDate(d.getDate() - k);
      const key = formatYmd(d);
      if (!existingDates.has(key)) {
        existingDates.add(key);
        next.push({
          date: key,
          text: `${selectedTopic.title} (Minor 테스트)`,
        });
      }
    }
    updateTopicLogs(selectedTopicId, next);
  }

  /** [초기화] 현재 Topic logs 비우기 */
  function testResetLogs() {
    if (!selectedTopicId) return;
    updateTopicLogs(selectedTopicId, []);
  }

  const sortedLogs = sortLogsNewestFirst(logs);
  const showMinorHint = logs.length >= 3;

  const isHome = selectedTopicId === null;

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      <main className="w-full max-w-md">
        {isHome ? (
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
              CHOLOGBOOK
            </p>
            <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900">
              Topics
            </h1>
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-800"
            >
              + Topic 추가
            </button>
            <ul className="mt-4 space-y-2">
              {topics.map((topic) => {
                const s = computeStreak(topic.logs.map((l) => l.date));
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-left text-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">
                        {topic.title}
                      </span>
                      <span className="flex shrink-0 items-center gap-3 text-xs text-zinc-600">
                        <span title="연속 기록">
                          <span aria-hidden>🔥</span>
                          {s}
                        </span>
                        <span title="Patch 개수">
                          <span aria-hidden>🧺</span>
                          {topic.logs.length}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : selectedTopic ? (
        <section
          className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100"
          aria-labelledby="topic-title"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedTopicId(null)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            >
              ← 홈
            </button>
          </div>
          <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
            CHOLOGBOOK · Patch
          </p>
          <h1
            id="topic-title"
            className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900"
          >
            {selectedTopic.title}
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
              title="바구니에 쌓인 Patch 수 (logs.length)"
            >
              <span aria-hidden>🧺</span>
              <span className="font-medium">{logs.length}개 쌓임</span>
            </span>
          </div>

          <div className="mt-6 space-y-3">
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

            {feedbackMessage ? (
              <p
                role="status"
                className="text-center text-sm font-medium text-emerald-700"
              >
                {feedbackMessage}
              </p>
            ) : null}

            {/* Minor 트리거: 로그 3개 이상일 때만 문구 (클릭 없음) */}
            {showMinorHint ? (
              <p className="text-center text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
                {`💭 ${logs.length}번이나 쌓였어요\n어떤 변화가 있었나요?`}
              </p>
            ) : null}

            {todayKey === "" ? (
              <p className="text-center text-xs text-zinc-400">
                날짜 정보를 불러오는 중…
              </p>
            ) : null}

            <button
              type="button"
              onClick={openEditPatch}
              disabled={patchDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-800 shadow-sm transition enabled:hover:bg-zinc-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <span aria-hidden>✍️</span>
              수정해서 기록
            </button>

            {editPatchOpen ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 space-y-2">
                <label className="block text-xs font-medium text-zinc-600">
                  오늘의 기록 (수정 가능)
                </label>
                <textarea
                  value={editPatchText}
                  onChange={(e) => setEditPatchText(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-400 focus:ring-2"
                  placeholder="예: 아침에 4p 읽기"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditPatchOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditPatch}
                    disabled={patchDisabled}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-5">
            <h2 className="text-sm font-semibold text-zinc-800">로그</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              최신순 · 날짜 + 메모
            </p>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
              {sortedLogs.length === 0 ? (
                <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-zinc-500">
                  아직 기록이 없어요. 위 버튼으로 오늘의 Patch를 남겨보세요.
                </li>
              ) : (
                sortedLogs.map((log) => (
                  <li
                    key={`${log.date}-${log.text}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-zinc-800"
                  >
                    <span className="min-w-0 flex-1 break-words">
                      <span className="font-mono text-[13px] text-zinc-700">
                        {log.date}
                      </span>
                      <span className="text-zinc-400"> - </span>
                      <span>{log.text}</span>
                      <span className="ml-1 text-emerald-600" aria-hidden>
                        ✔
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
        ) : null}
      </main>

      {/* 테스트 모드: 우측 하단 고정 + 패널 (본문 클릭을 가리지 않음) */}
      {isTestMode ? (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
          {testPanelOpen ? (
            <div className="w-64 rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-lg ring-1 ring-zinc-100">
              <p className="mb-2 text-xs font-medium text-zinc-500">
                테스트 도구
              </p>
              {!selectedTopicId ? (
                <p className="mb-2 text-xs text-amber-700">
                  Topic을 선택한 뒤 사용할 수 있어요.
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!selectedTopicId}
                  onClick={testAddPastDay}
                  className="rounded-lg bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-800 enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + 하루 추가
                </button>
                <button
                  type="button"
                  disabled={!selectedTopicId}
                  onClick={testForceMinor}
                  className="rounded-lg bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-800 enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  💭 Minor 테스트
                </button>
                <button
                  type="button"
                  disabled={!selectedTopicId}
                  onClick={testResetLogs}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left font-medium text-red-800 enabled:hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  초기화
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsTestMode(false)}
                className="mt-3 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
              >
                테스트 모드 끄기
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setTestPanelOpen((o) => !o)}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-md ring-1 ring-zinc-100 hover:bg-zinc-50"
          >
            🛠 테스트
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsTestMode(true)}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50"
        >
          테스트 모드 켜기
        </button>
      )}
    </div>
  );
}
