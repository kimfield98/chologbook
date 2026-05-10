"use client";

import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { LogRecordCarousel } from "@/components/chologbook/LogRecordCarousel";
import { getLogType } from "@/lib/chologbook/logs";
import { formatMajorButtonLabel } from "@/lib/chologbook/majorRules";
import {
  focusRingPrimary,
  neutralSolidButton,
  primaryCtaFullWidth,
} from "@/lib/ui/appButtonStyles";

export default function MajorTabPage() {
  const { patch, canWrite } = useAppContext();

  const majorLogs = useMemo(
    () => patch.sortedLogs.filter((l) => getLogType(l) === "major"),
    [patch.sortedLogs],
  );

  const majorCtaLabel = formatMajorButtonLabel({
    todayKey: patch.todayKey,
    canWrite,
    canStartMajor: patch.canStartMajor,
    minorCountInSegment: patch.minorCount,
    hasSelectedTopic: Boolean(patch.selectedTopic),
  });

  const majorCtaDisabled =
    patch.todayKey === "" || !canWrite || !patch.canStartMajor;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <LogRecordCarousel
          logs={majorLogs}
          kindLabel="Major"
          emptyMessage="Major 기록이 아직 없어요."
        />
      </div>

      <div className="shrink-0 space-y-3 border-t border-zinc-200/80 bg-zinc-50/80 pt-4">
        {!patch.majorInputMode ? (
          <button
            type="button"
            onClick={patch.handleOpenMajorComposer}
            disabled={majorCtaDisabled}
            className={primaryCtaFullWidth}
          >
            {majorCtaLabel}
          </button>
        ) : (
          <>
            <p className="text-center text-sm font-semibold text-zinc-900">
              이 구간을 정리해요
            </p>
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <label className="block text-sm font-bold text-zinc-900">
                이 구간에서 달라진 점
              </label>
              <textarea
                value={patch.majorDraftChange}
                onChange={(e) => patch.setMajorDraftChange(e.target.value)}
                rows={3}
                className={`w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ${focusRingPrimary}`}
              />
              <label className="block text-sm font-bold text-zinc-900">
                가장 기억에 남는 순간
              </label>
              <textarea
                value={patch.majorDraftMoment}
                onChange={(e) => patch.setMajorDraftMoment(e.target.value)}
                rows={3}
                className={`w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ${focusRingPrimary}`}
              />
              <label className="block text-sm font-bold text-zinc-900">
                다음 Patch 방향
              </label>
              <textarea
                value={patch.majorDraftNext}
                onChange={(e) => patch.setMajorDraftNext(e.target.value)}
                rows={2}
                className={`w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ${focusRingPrimary}`}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={patch.handleCancelMajor}
                className="rounded-xl border border-zinc-300/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={patch.handleSaveMajor}
                disabled={patch.majorSaveDisabled || !canWrite}
                className={`${neutralSolidButton} px-4 py-2.5 shadow-sm`}
              >
                저장
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
