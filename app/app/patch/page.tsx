"use client";

import { useAppContext } from "@/app/app/AppContext";

export default function PatchTabPage() {
  const { patch, canWrite } = useAppContext();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex min-h-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="w-full space-y-3">
          {patch.latestNextPatchDirection ? (
            <div className="flex items-start justify-center gap-2 text-sm text-emerald-800">
              <div className="min-w-0">
                <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80">
                  다음 흐름
                </p>
                <p className="mt-1 whitespace-pre-wrap text-center font-bold leading-relaxed text-emerald-900/90">
                  {patch.latestNextPatchDirection}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-400">
              다음 흐름을 준비 중이에요.
            </p>
          )}

          <button
            type="button"
            onClick={patch.handlePatch}
            disabled={patch.patchDisabled || !canWrite}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
          >
            {patch.alreadyPatchedToday
              ? "오늘은 이미 기록했어요"
              : "오늘도 했어요"}
          </button>

          {patch.feedbackMessage ? (
            <p className="text-center text-sm font-medium text-emerald-700">
              {patch.feedbackMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
