"use client";

import { useMemo } from "react";
import { TopicList } from "@/components/chologbook/TopicList";
import { useAppContext } from "@/app/app/AppContext";
import { getFocusTopicId } from "@/lib/chologbook/getFocusTopicId";
import { getLogType } from "@/lib/chologbook/logs";

export default function PatchTabPage() {
  const { topicsApi, logsApi, patch, canWrite, effectiveViewMode } =
    useAppContext();

  const focusVisualId = getFocusTopicId(
    topicsApi.selectedTopicId,
    topicsApi.lastFocusTopicId,
  );

  const patchLogs = useMemo(
    () => patch.sortedLogs.filter((l) => getLogType(l) === "patch"),
    [patch.sortedLogs],
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Topics
        </p>
        <div className="mt-3 max-h-64 overflow-y-auto pr-1">
          <TopicList
            topics={topicsApi.topics}
            allLogs={logsApi.logs}
            focusVisualId={focusVisualId}
            onSelectTopic={topicsApi.selectTopic}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex-1 min-h-0">
        {effectiveViewMode === "public" ? (
          <p className="text-center text-xs text-zinc-500">
            운영자 흐름은 읽기 전용이에요.
          </p>
        ) : null}

        <div className="mt-3 space-y-3">
          {patch.latestNextPatchDirection ? (
            <div className="flex items-start justify-center gap-2 text-sm text-emerald-800">
              <div className="min-w-0">
                <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80">
                  다음 흐름
                </p>
                <p className="mt-1 whitespace-pre-wrap font-bold text-center leading-relaxed text-emerald-900/90">
                  {patch.latestNextPatchDirection}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-400">
              다음 흐름을 준비 중이에요.
            </p>
          )}

          {effectiveViewMode === "public" ? (
            <div className="pt-1">
              <p className="text-xs font-semibold text-zinc-700">최근 Patch</p>
              <ul className="mt-2 max-h-72 overflow-y-auto divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                {patchLogs.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-zinc-500">
                    아직 공개된 기록이 없어요.
                  </li>
                ) : (
                  patchLogs.slice(0, 8).map((log) => (
                    <li key={log.id} className="px-3 py-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm text-zinc-800">
                          {log.text}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-zinc-500">
                          {log.date}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : (
            <button
              type="button"
              onClick={patch.handlePatch}
              disabled={patch.patchDisabled || !canWrite}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
            >
              <span aria-hidden>✔</span>
              {patch.alreadyPatchedToday
                ? "오늘은 이미 기록했어요"
                : "오늘도 했어요"}
            </button>
          )}

          {patch.feedbackMessage ? (
            <p className="text-center text-sm font-medium text-emerald-700">
              {patch.feedbackMessage}
            </p>
          ) : null}

          {!canWrite && effectiveViewMode !== "public" ? (
            <p className="text-center text-xs text-zinc-500">
              기록은 로그인 후에만 가능해요.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

