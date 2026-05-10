"use client";

import { useCallback, useEffect, useState } from "react";
import type { Log } from "@/lib/chologbook/types";

type LogRecordCarouselProps = {
  logs: Log[];
  /** 종류 표기 (예: Minor, Major) */
  kindLabel: string;
  /** 기록이 없을 때 메시지 */
  emptyMessage: string;
};

/**
 * 기록을 한 건씩 보고 이전/다음으로 넘깁니다.
 */
export function LogRecordCarousel({
  logs,
  kindLabel,
  emptyMessage,
}: LogRecordCarouselProps) {
  const len = logs.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((i) => (len === 0 ? 0 : Math.min(Math.max(i, 0), len - 1)));
  }, [len]);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        if (len === 0) return 0;
        return (i + delta + len) % len;
      });
    },
    [len],
  );

  const current = len > 0 ? logs[index] : null;

  const contentWrap =
    "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-800 shadow-sm";

  const navBtn =
    "rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition enabled:hover:bg-zinc-100 enabled:hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="space-y-3">
      {len === 0 ? (
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          <div className={contentWrap} key={current?.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                {kindLabel}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
                {current?.date}
              </span>
            </div>
            <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {current?.text}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
            <button
              type="button"
              aria-label="이전 기록"
              onClick={() => go(-1)}
              disabled={len <= 1}
              className={navBtn}
            >
              이전
            </button>
            <span className="shrink-0 tabular-nums text-xs text-zinc-400">
              {index + 1} / {len}
            </span>
            <button
              type="button"
              aria-label="다음 기록"
              onClick={() => go(1)}
              disabled={len <= 1}
              className={navBtn}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
