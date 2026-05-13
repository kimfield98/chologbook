"use client";

import { useAppContext } from "@/app/app/AppContext";
import { patchIdleCtaFullWidth, patchPrimaryCtaFullWidth } from "@/lib/ui/appButtonStyles";

export default function PatchTabPage() {
  const { patch, canWrite, authSession } = useAppContext();

  const patchCtaDisabled =
    authSession.isGooglePopupPending ||
    (canWrite && (patch.patchDisabled || !patch.selectedTopic));

  const patchCtaLabel = !canWrite
    ? authSession.isGooglePopupPending
      ? "로그인 연결 중…"
      : "로그인하고 기록하기"
    : patch.alreadyPatchedToday
      ? "오늘은 이미 기록했어요"
      : "오늘도 했어요";

  const patchCtaClass =
    patchCtaDisabled && patchCtaLabel === "오늘도 했어요"
      ? patchIdleCtaFullWidth
      : patchPrimaryCtaFullWidth;

  return (
    <section className="flex flex-1 flex-col justify-center gap-5 py-6">
      <div className="flex min-h-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="w-full space-y-3">
          <p className="text-center text-xs font-semibold text-zinc-500">Patch 기록하기</p>
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
            onClick={() => {
              if (!canWrite) {
                void authSession.signInWithGoogle();
                return;
              }
              void patch.handlePatch();
            }}
            disabled={patchCtaDisabled}
            className={patchCtaClass}
          >
            {patchCtaLabel}
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
