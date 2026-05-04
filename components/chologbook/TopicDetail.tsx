"use client";

import { useEffect, useState } from "react";
import { patchTotalSummarySentence } from "@/lib/chologbook/patchTotalSummary";
import { getLogType } from "@/lib/chologbook/logs";
import type { Log } from "@/lib/chologbook/types";

export type TopicDetailProps = {
  onHome: () => void;
  title: string;
  totalPatchCount: number;
  sortedLogs: Log[];
  referenceLogsPatchMinor: Log[];
  latestNextPatchDirection: string;
  canStartMajor: boolean;
  majorLockHint: string;
  majorProgressLabel: string;
  onOpenMajorComposer: () => void;
  majorInputMode: boolean;
  majorDraftChange: string;
  onMajorDraftChange: (value: string) => void;
  majorDraftMoment: string;
  onMajorDraftMoment: (value: string) => void;
  majorDraftNext: string;
  onMajorDraftNext: (value: string) => void;
  onCancelMajor: () => void;
  onSaveMajor: () => void;
  majorSaveDisabled: boolean;
  minorInputMode: boolean;
  minorDraftText: string;
  onMinorDraftText: (value: string) => void;
  alreadyMinoredToday: boolean;
  minorOpenDisabled: boolean;
  onOpenMinorInput: () => void;
  onCancelMinor: () => void;
  onSaveMinor: () => void;
  todayKey: string;
  alreadyPatchedToday: boolean;
  patchDisabled: boolean;
  feedbackMessage: string;
  onPatch: () => void;
};

export function TopicDetail({
  onHome,
  title,
  totalPatchCount,
  sortedLogs,
  referenceLogsPatchMinor,
  latestNextPatchDirection,
  canStartMajor,
  majorLockHint,
  majorProgressLabel,
  onOpenMajorComposer,
  majorInputMode,
  majorDraftChange,
  onMajorDraftChange,
  majorDraftMoment,
  onMajorDraftMoment,
  majorDraftNext,
  onMajorDraftNext,
  onCancelMajor,
  onSaveMajor,
  majorSaveDisabled,
  minorInputMode,
  minorDraftText,
  onMinorDraftText,
  alreadyMinoredToday,
  minorOpenDisabled,
  onOpenMinorInput,
  onCancelMinor,
  onSaveMinor,
  todayKey,
  alreadyPatchedToday,
  patchDisabled,
  feedbackMessage,
  onPatch,
}: TopicDetailProps) {
  const minorSaveDisabled = !minorDraftText.trim();
  const [referenceOpen, setReferenceOpen] = useState(true);

  useEffect(() => {
    if (majorInputMode) setReferenceOpen(true);
  }, [majorInputMode]);

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
        {majorInputMode ? "CHOLOGBOOK · Major" : "CHOLOGBOOK · Patch"}
      </p>
      <h1
        id="topic-title"
        className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900"
      >
        {title}
      </h1>

      {!majorInputMode && latestNextPatchDirection ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">
            다음 Patch 방향
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed">
            {latestNextPatchDirection}
          </p>
        </div>
      ) : null}

      <p
        className="mt-5 text-center text-sm leading-relaxed text-zinc-600"
        title="이 토픽에 남긴 Patch 총개수"
      >
        {patchTotalSummarySentence(totalPatchCount)}
      </p>

      {majorInputMode ? (
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm font-medium text-zinc-700">
            이 구간을 정리하는 Major를 작성해 주세요. (템플릿)
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-3">
            <label className="block text-xs font-semibold text-amber-900">
              이 구간에서 달라진 점
            </label>
            <textarea
              value={majorDraftChange}
              onChange={(e) => onMajorDraftChange(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-2"
              placeholder="예: 매일 조금씩이라도 하게 됐어요"
            />
            <label className="block text-xs font-semibold text-amber-900">
              가장 기억에 남는 순간
            </label>
            <textarea
              value={majorDraftMoment}
              onChange={(e) => onMajorDraftMoment(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-2"
              placeholder="예: 2주 연속했을 때 스스로 놀랐던 날"
            />
            <label className="block text-xs font-semibold text-amber-900">
              다음 Patch 방향
            </label>
            <textarea
              value={majorDraftNext}
              onChange={(e) => onMajorDraftNext(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-2"
              placeholder="예: 시간을 5분만 줄여보기"
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80">
            <button
              type="button"
              onClick={() => setReferenceOpen((o) => !o)}
              aria-expanded={referenceOpen}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-800"
            >
              <span>Patch · Minor 참고</span>
              <span className="text-zinc-500">{referenceOpen ? "접기" : "펼치기"}</span>
            </button>
            {referenceOpen ? (
              <ul className="max-h-48 space-y-1.5 overflow-y-auto border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600">
                {referenceLogsPatchMinor.length === 0 ? (
                  <li className="py-2 text-zinc-500">참고할 Patch/Minor가 없습니다.</li>
                ) : (
                  referenceLogsPatchMinor.map((log) => {
                    const t = getLogType(log);
                    return (
                      <li key={log.id} className="break-words border-b border-zinc-100 pb-1.5 last:border-0">
                        <span className="font-mono text-[11px] text-zinc-500">{log.date}</span>
                        <span className="mx-1 text-zinc-400">
                          {t === "minor" ? "Minor" : "Patch"}
                        </span>
                        <span>{log.text}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancelMajor}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSaveMajor}
              disabled={majorSaveDisabled}
              className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm enabled:hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Major 저장
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
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

          {todayKey === "" ? (
            <p className="text-center text-xs text-zinc-400">
              날짜 정보를 불러오는 중…
            </p>
          ) : null}

          {!minorInputMode ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={onOpenMinorInput}
                disabled={minorOpenDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/90 bg-amber-50/95 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm ring-1 ring-amber-200/60 transition enabled:hover:bg-amber-100/90 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:ring-0 disabled:shadow-none"
              >
                오늘 한 줄 (Minor)
              </button>
              {alreadyMinoredToday ? (
                <p className="text-center text-xs text-zinc-500">
                  오늘은 이미 한 줄을 남겼어요.
                </p>
              ) : null}
            </div>
          ) : null}

          {minorInputMode ? (
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/50 p-3 space-y-2 ring-1 ring-amber-100/80">
              <p className="text-xs font-medium text-amber-950">
                오늘 이 토픽에 대한 한 줄을 남겨보세요
              </p>
              <textarea
                value={minorDraftText}
                onChange={(e) => onMinorDraftText(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-amber-200/90 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-amber-500/25 focus:border-amber-400 focus:ring-2"
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
                  className="rounded-lg bg-amber-800 px-3 py-2 text-sm font-semibold text-amber-50 enabled:hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                >
                  저장
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5 border-t border-zinc-100 pt-3">
            <p className="text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              구간 정리 · Major
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <span>이 구간 한 줄</span>
              <span className="font-mono font-medium text-zinc-700">
                {majorProgressLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenMajorComposer}
              disabled={!canStartMajor || todayKey === ""}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-900 shadow-sm transition enabled:hover:bg-stone-200/90 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
            >
              구간 정리하기 (Major)
            </button>
            <p className="text-center text-xs leading-relaxed text-zinc-600">
              {majorLockHint}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-zinc-100 pt-5">
        <h2 className="text-sm font-semibold text-zinc-800">로그</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          시간순 · Patch / Minor / Major
        </p>
        <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1 text-sm">
          {sortedLogs.length === 0 ? (
            <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-zinc-500">
              아직 기록이 없어요. 위 버튼으로 오늘의 Patch를 남겨보세요.
            </li>
          ) : (
            sortedLogs.map((log) => {
              const kind = getLogType(log);
              const isMinor = kind === "minor";
              const isMajor = kind === "major";

              if (isMajor) {
                return (
                  <li key={log.id} className="list-none">
                    <div
                      className="my-3 border-t-2 border-amber-300 pt-3"
                      role="separator"
                      aria-label="Major 구간"
                    />
                    <div className="rounded-xl border-2 border-amber-300/80 bg-amber-50/50 px-3 py-3 text-zinc-800 shadow-sm">
                      <span className="inline-block rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                        Major
                      </span>
                      <span className="ml-2 font-mono text-[13px] text-amber-900/80">
                        {log.date}
                      </span>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {log.text}
                      </p>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={log.id}
                  className={`flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-zinc-800 ${
                    isMinor
                      ? "border-orange-200/90 bg-orange-50/50"
                      : "border-zinc-100 bg-zinc-50/50"
                  }`}
                >
                  <span className="min-w-0 flex-1 break-words">
                    <span
                      className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isMinor
                          ? "bg-orange-200/90 text-orange-950"
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
                      <span className="ml-1 text-orange-700/90" aria-hidden>
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
