/**
 * 앱 CTA — 블로그 저장·Minor/Major 등 기본은 에메랄드(`primaryCta*`).
 * Patch처럼 행동 유도가 중요한 곳도 동일 톤으로 두되, import 이름으로 구분 가능.
 */

const disabledPrimaryCta =
  "disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none";

/** 전폭 주요 CTA — 블로그 compact와 동일 에메랄드 */
export const primaryCtaFullWidth =
  "flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-4 text-center text-base font-semibold leading-snug text-white shadow-sm transition enabled:hover:border-emerald-700 enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] " +
  disabledPrimaryCta;

/** Patch 탭 등 — `primaryCtaFullWidth`와 동일(초록 유지) */
export const patchPrimaryCtaFullWidth = primaryCtaFullWidth;

/** 랜딩 등 전체 너비·sm */
export const primaryCtaLanding =
  "w-full rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-emerald-700 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-200 disabled:text-zinc-500";

/** 블로그 저장 등 compact */
export const primaryCtaCompact =
  "shrink-0 rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-emerald-700 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-200 disabled:text-zinc-500";

/** 진한 중립(저장 등) */
export const neutralSolidButton =
  "rounded-xl border border-zinc-700 bg-zinc-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-zinc-800 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-300 disabled:text-zinc-500";

/** 기본 입력 포커스(에메랄드) */
export const focusRingPrimary =
  "outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2";
