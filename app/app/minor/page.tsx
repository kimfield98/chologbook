"use client";

import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { getLogType } from "@/lib/chologbook/logs";

export default function MinorTabPage() {
  const { patch, topicsApi, canWrite } = useAppContext();

  const selected = topicsApi.selectedTopicId;
  const minorLogs = useMemo(
    () => patch.sortedLogs.filter((l) => getLogType(l) === "minor"),
    [patch.sortedLogs],
  );

  if (!selected) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center text-sm text-zinc-600 shadow-sm">
        먼저 Patch 탭에서 Topic을 선택해 주세요.
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-center text-xs text-zinc-500">
          오늘 떠오른 생각을 한 줄로 남겨요.
        </p>

        {!patch.minorInputMode ? (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={patch.handleOpenMinorInput}
              disabled={patch.minorOpenDisabled || !canWrite}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
            >
              오늘 한 줄 남기기
            </button>
            {patch.alreadyMinoredToday ? (
              <p className="text-center text-xs text-zinc-500">
                오늘은 이미 한 줄을 남겼어요.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                필요할 때만 조용히 남겨요.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3">
            <textarea
              value={patch.minorDraftText}
              onChange={(e) => patch.setMinorDraftText(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2"
              placeholder="예: 오늘은 시작이 쉬웠다"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={patch.handleCancelMinor}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white/70"
              >
                취소
              </button>
              <button
                type="button"
                onClick={patch.handleSaveMinor}
                disabled={!patch.minorDraftText.trim() || !canWrite}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-zinc-800">Minor 기록</p>
        <ul className="mt-3 space-y-2">
          {minorLogs.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-sm text-zinc-500">
              아직 남긴 Minor가 없어요.
            </li>
          ) : (
            minorLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-2xl border border-orange-200/80 bg-orange-50/40 px-3 py-3 text-zinc-800"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-950/80">
                    Minor
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
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

