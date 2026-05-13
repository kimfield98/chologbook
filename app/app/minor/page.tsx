"use client";

import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { LogRecordCarousel } from "@/components/chologbook/LogRecordCarousel";
import { getLogType } from "@/lib/chologbook/logs";
import {
  focusRingPrimary,
  neutralSolidButton,
  primaryCtaFullWidth,
} from "@/lib/ui/appButtonStyles";

export default function MinorTabPage() {
  const { patch, canWrite, authSession } = useAppContext();

  const minorLogs = useMemo(
    () => patch.sortedLogs.filter((l) => getLogType(l) === "minor"),
    [patch.sortedLogs],
  );

  const minorCtaDisabled =
    authSession.isGooglePopupPending ||
    (canWrite && patch.minorOpenDisabled);

  const minorCtaLabel = !canWrite
    ? authSession.isGooglePopupPending
      ? "로그인 연결 중…"
      : "로그인하고 기록하기"
    : "오늘 한 줄 남기기";

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <LogRecordCarousel
          logs={minorLogs}
          kindLabel="Minor"
          emptyMessage="Minor 기록이 아직 없어요."
        />
      </div>

      <div className="shrink-0 space-y-3 border-t border-zinc-200/80 bg-zinc-50/80 pt-4">
        {!patch.minorInputMode ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (!canWrite) {
                  void authSession.signInWithGoogle();
                  return;
                }
                patch.handleOpenMinorInput();
              }}
              disabled={minorCtaDisabled}
              className={primaryCtaFullWidth}
            >
              {minorCtaLabel}
            </button>
            {patch.alreadyMinoredToday ? (
              <p className="text-center text-xs text-zinc-500">
                오늘은 이미 한 줄을 남겼어요.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <textarea
              value={patch.minorDraftText}
              onChange={(e) => patch.setMinorDraftText(e.target.value)}
              rows={4}
              className={`w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ${focusRingPrimary}`}
              placeholder="예: 오늘은 시작이 쉬웠다"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={patch.handleCancelMinor}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white/80"
              >
                취소
              </button>
              <button
                type="button"
                onClick={patch.handleSaveMinor}
                disabled={!patch.minorDraftText.trim() || !canWrite}
                className={neutralSolidButton}
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
