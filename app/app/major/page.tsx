"use client";

import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { getLogType } from "@/lib/chologbook/logs";

export default function MajorTabPage() {
  const { patch, canWrite } = useAppContext();

  const majorLogs = useMemo(
    () => patch.sortedLogs.filter((l) => getLogType(l) === "major"),
    [patch.sortedLogs],
  );

  const remainingMinorCount = (() => {
    const raw = String(patch.majorProgressLabel ?? "");
    const m = raw.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
    if (!m) return null;
    const current = Number(m[1]);
    const need = Number(m[2]);
    if (!Number.isFinite(current) || !Number.isFinite(need)) return null;
    return Math.max(0, need - current);
  })();

  const majorCtaLabel = (() => {
    if (patch.todayKey === "") return "날짜 불러오는 중…";
    if (!canWrite) return "로그인 후 작성할 수 있어요";
    if (patch.canStartMajor) return "지금 기록하기";
    if (typeof remainingMinorCount === "number") {
      return remainingMinorCount <= 0
        ? "지금 기록하기"
        : `Minor 기록이 ${remainingMinorCount}개 더 필요해요`;
    }
    return patch.majorLockHint || "Minor 기록이 더 필요해요";
  })();

  const majorCtaDisabled =
    patch.todayKey === "" || !canWrite || !patch.canStartMajor;

  return (
    <section className="space-y-5">
      {!patch.majorInputMode ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600">
            {patch.majorLockHint}
          </p>
          <button
            type="button"
            onClick={patch.handleOpenMajorComposer}
            disabled={majorCtaDisabled}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
          >
            {majorCtaLabel}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-center text-sm font-semibold text-zinc-900">
            이 구간을 정리해요
          </p>
          <div className="mt-4 space-y-3 rounded-2xl bg-amber-50/40 p-3">
            <label className="block text-sm font-bold text-amber-950">
              이 구간에서 달라진 점
            </label>
            <textarea
              value={patch.majorDraftChange}
              onChange={(e) => patch.setMajorDraftChange(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2"
            />
            <label className="block text-sm font-bold text-amber-950">
              가장 기억에 남는 순간
            </label>
            <textarea
              value={patch.majorDraftMoment}
              onChange={(e) => patch.setMajorDraftMoment(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2"
            />
            <label className="block text-sm font-bold text-amber-950">
              다음 Patch 방향
            </label>
            <textarea
              value={patch.majorDraftNext}
              onChange={(e) => patch.setMajorDraftNext(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={patch.handleCancelMajor}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={patch.handleSaveMajor}
              disabled={patch.majorSaveDisabled || !canWrite}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              저장
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-zinc-800">이전 Major</p>
        <ul className="mt-3 space-y-3">
          {majorLogs.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-sm text-zinc-500">
              아직 남긴 Major가 없어요.
            </li>
          ) : (
            majorLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-2xl bg-amber-50/40 px-3 py-3 text-zinc-800"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-zinc-900">Major</span>
                  <span className="font-mono text-[11px] text-amber-900/80">
                    {log.date}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {log.text}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
