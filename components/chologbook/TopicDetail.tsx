"use client";

import { getLogType } from "@/lib/chologbook/logs";
import type { Log } from "@/lib/chologbook/types";

export type TopicDetailProps = {
  onHome: () => void;
  title: string;
  streak: number;
  patchCount: number;
  sortedLogs: Log[];
  showMajorTimingMessage: boolean;
  showMinorFork: boolean;
  minorInputMode: boolean;
  minorDraftText: string;
  onMinorDraftText: (value: string) => void;
  onContinueRecording: () => void;
  onOpenMinorInput: () => void;
  onCancelMinor: () => void;
  onSaveMinor: () => void;
  todayKey: string;
  alreadyPatchedToday: boolean;
  patchDisabled: boolean;
  feedbackMessage: string;
  editPatchOpen: boolean;
  editPatchText: string;
  onEditPatchText: (value: string) => void;
  onPatch: () => void;
  onOpenEditPatch: () => void;
  onCloseEditPatch: () => void;
  onSaveEditPatch: () => void;
};

export function TopicDetail({
  onHome,
  title,
  streak,
  patchCount,
  sortedLogs,
  showMajorTimingMessage,
  showMinorFork,
  minorInputMode,
  minorDraftText,
  onMinorDraftText,
  onContinueRecording,
  onOpenMinorInput,
  onCancelMinor,
  onSaveMinor,
  todayKey,
  alreadyPatchedToday,
  patchDisabled,
  feedbackMessage,
  editPatchOpen,
  editPatchText,
  onEditPatchText,
  onPatch,
  onOpenEditPatch,
  onCloseEditPatch,
  onSaveEditPatch,
}: TopicDetailProps) {
  const minorSaveDisabled = !minorDraftText.trim();

  return (
    <section
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100"
      aria-labelledby="topic-title"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onHome}
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
        {title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-orange-800 ring-1 ring-orange-100"
          title="연속 기록 일수 (Patch 기준)"
        >
          <span aria-hidden>🔥</span>
          <span className="font-medium text-orange-900">{streak}일</span>
          <span className="text-orange-700/90">유지 중</span>
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-900 ring-1 ring-emerald-100"
          title="쌓인 Patch 수"
        >
          <span aria-hidden>🧺</span>
          <span className="font-medium">{patchCount}개 쌓임</span>
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {showMajorTimingMessage ? (
          <p
            className="rounded-xl border border-violet-200 bg-violet-50/90 px-4 py-3 text-center text-sm font-medium leading-relaxed text-violet-900 whitespace-pre-line"
            role="status"
          >
            {`이제는 정리할 타이밍입니다.\n당신의 변화를 하나의 글로 남겨보세요.`}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onPatch}
          disabled={patchDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
        >
          <span aria-hidden>✔</span>
          {alreadyPatchedToday ? "오늘은 이미 기록했어요" : "오늘도 했어요"}
        </button>

        {feedbackMessage ? (
          <p
            role="status"
            className="text-center text-sm font-medium text-emerald-700"
          >
            {feedbackMessage}
          </p>
        ) : null}

        {showMinorFork ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 space-y-3">
            <p className="text-center text-sm font-medium text-zinc-800 whitespace-pre-line">
              {`많이 쌓였어요.\n계속 기록을 이어가시겠어요, 아니면\n지금까지의 흐름에 대해 간단한 피드백을 남겨볼까요?`}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onContinueRecording}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                계속 기록
              </button>
              <button
                type="button"
                onClick={onOpenMinorInput}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                피드백 남기기
              </button>
            </div>
          </div>
        ) : null}

        {minorInputMode ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
            <p className="text-xs font-medium text-emerald-900">
              Minor · 지금까지의 느낌이나 변화를 짧게 남겨보세요
            </p>
            <textarea
              value={minorDraftText}
              onChange={(e) => onMinorDraftText(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-emerald-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-400 focus:ring-2"
              placeholder="예: 요즘 집중이 잘 된다"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelMinor}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-white/80"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onSaveMinor}
                disabled={minorSaveDisabled}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                저장
              </button>
            </div>
          </div>
        ) : null}

        {todayKey === "" ? (
          <p className="text-center text-xs text-zinc-400">
            날짜 정보를 불러오는 중…
          </p>
        ) : null}

        <button
          type="button"
          onClick={onOpenEditPatch}
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
              onChange={(e) => onEditPatchText(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-400 focus:ring-2"
              placeholder="예: 아침에 4p 읽기"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCloseEditPatch}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={onSaveEditPatch}
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
          최신순 · Patch / Minor 구분
        </p>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
          {sortedLogs.length === 0 ? (
            <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-zinc-500">
              아직 기록이 없어요. 위 버튼으로 오늘의 Patch를 남겨보세요.
            </li>
          ) : (
            sortedLogs.map((log) => {
              const isMinor = getLogType(log) === "minor";
              return (
                <li
                  key={log.id}
                  className={`flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-zinc-800 ${
                    isMinor
                      ? "border-violet-200 bg-violet-50/60"
                      : "border-zinc-100 bg-zinc-50/50"
                  }`}
                >
                  <span className="min-w-0 flex-1 break-words">
                    <span
                      className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isMinor
                          ? "bg-violet-200 text-violet-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {isMinor ? "Minor" : "Patch"}
                    </span>
                    <span className="font-mono text-[13px] text-zinc-700">
                      {log.date}
                    </span>
                    <span className="text-zinc-400"> - </span>
                    <span>{log.text}</span>
                    {!isMinor ? (
                      <span className="ml-1 text-emerald-600" aria-hidden>
                        ✔
                      </span>
                    ) : (
                      <span className="ml-1 text-violet-600" aria-hidden>
                        💭
                      </span>
                    )}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
