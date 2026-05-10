"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLogType } from "@/lib/chologbook/logs";
import { countTopicVersion, topicVersionLabelFromLogs } from "@/lib/chologbook/topicVersion";
import type { Log } from "@/lib/chologbook/types";

export type TopicDetailProps = {
  onHome: () => void;
  onDeleteTopic: () => void;
  canWrite: boolean;
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
  onDeleteTopic,
  canWrite,
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
  const referenceOpenEffective = majorInputMode ? true : referenceOpen;
  const [dangerMenuOpen, setDangerMenuOpen] = useState(false);
  const [tab, setTab] = useState<"patch" | "minor" | "major" | "profile">(
    "patch",
  );
  const versionLabel = topicVersionLabelFromLogs(sortedLogs);
  const versionCounts = countTopicVersion(sortedLogs);

  const effectiveTab = majorInputMode ? "major" : minorInputMode ? "minor" : tab;

  const minorLogs = useMemo(
    () => sortedLogs.filter((l) => getLogType(l) === "minor"),
    [sortedLogs],
  );
  const majorLogs = useMemo(
    () => sortedLogs.filter((l) => getLogType(l) === "major"),
    [sortedLogs],
  );

  return (
    <section
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm ring-1 ring-zinc-100"
      aria-labelledby="topic-title"
    >
      <header className="mb-6">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onHome}
            className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            ← 홈
          </button>
          {canWrite ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDangerMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={dangerMenuOpen}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                title="메뉴"
              >
                ⋯
              </button>
              {dangerMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled
                    className="block w-full px-4 py-2 text-left text-sm text-zinc-400"
                    title="준비 중"
                  >
                    이름 수정 (준비 중)
                  </button>
                  <div className="h-px bg-zinc-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDangerMenuOpen(false);
                      onDeleteTopic();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
          CHOLOGBOOK
        </p>
        <h1
          id="topic-title"
          className="mt-2 text-center text-2xl font-semibold tracking-tight text-zinc-900"
        >
          {title}
        </h1>
      </header>

      <div className="min-h-[22rem] pb-20">
        {effectiveTab === "patch" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
                title={`이 토픽의 누적: Major ${versionCounts.major}, Minor ${versionCounts.minor}, Patch ${versionCounts.patch}`}
              >
                {versionLabel}
              </span>
            </div>

            {latestNextPatchDirection ? (
              <div className="flex items-start justify-center gap-2 text-sm text-emerald-800">
                <span className="mt-[2px] text-emerald-600" aria-hidden>
                  🌱
                </span>
                <div className="min-w-0">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80">
                    다음 흐름
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-center leading-relaxed text-emerald-900/90">
                    {latestNextPatchDirection}
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
              onClick={onPatch}
              disabled={patchDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
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
            ) : (
              <p className="text-center text-xs text-zinc-500">
                오늘의 흐름만 남겨요. (Patch {totalPatchCount})
              </p>
            )}
          </div>
        ) : null}

        {effectiveTab === "minor" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
                title={`이 토픽의 누적: Major ${versionCounts.major}, Minor ${versionCounts.minor}, Patch ${versionCounts.patch}`}
              >
                {versionLabel}
              </span>
            </div>

            {!minorInputMode ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onOpenMinorInput}
                  disabled={minorOpenDisabled}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
                >
                  오늘 한 줄 남기기
                </button>
                {alreadyMinoredToday ? (
                  <p className="text-center text-xs text-zinc-500">
                    오늘은 이미 한 줄을 남겼어요.
                  </p>
                ) : (
                  <p className="text-center text-xs text-zinc-500">
                    떠오른 생각이 있을 때만 조용히 남겨요.
                  </p>
                )}
              </div>
            ) : null}

            {minorInputMode ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 space-y-2">
                <p className="text-xs font-medium text-zinc-700">
                  오늘 떠오른 한 줄을 남겨보세요
                </p>
                <textarea
                  value={minorDraftText}
                  onChange={(e) => onMinorDraftText(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/20 focus:border-emerald-300 focus:ring-2"
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
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : null}

            <div className="border-t border-zinc-100 pt-4">
              <p className="text-xs font-semibold text-zinc-700">오늘의 한 줄들</p>
              <ul className="mt-3 space-y-2">
                {minorLogs.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-sm text-zinc-500">
                    아직 남긴 Minor가 없어요.
                  </li>
                ) : (
                  minorLogs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-xl border border-orange-200/80 bg-orange-50/40 px-3 py-2 text-sm text-zinc-800"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-950/80">
                          Minor
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {log.date}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
                        {log.text}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}

        {effectiveTab === "major" ? (
          <div className="space-y-4">
            {!majorInputMode ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800">
                    구간 정리
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{majorLockHint}</p>
                </div>

                <button
                  type="button"
                  onClick={onOpenMajorComposer}
                  disabled={!canStartMajor || todayKey === ""}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-base font-semibold text-emerald-950 shadow-sm transition enabled:hover:bg-emerald-100/70 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
                >
                  Major 기록하기
                </button>
                <p className="text-center text-xs text-zinc-500">
                  현재 구간 상태: <span className="font-mono">{majorProgressLabel}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm font-medium text-zinc-700">
                  이 구간을 정리하는 Major를 작성해 주세요.
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
                    aria-expanded={referenceOpenEffective}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-800"
                  >
                    <span>Patch · Minor 참고</span>
                    <span className="text-zinc-500">
                      {referenceOpenEffective ? "접기" : "펼치기"}
                    </span>
                  </button>
                  {referenceOpenEffective ? (
                    <ul className="max-h-48 space-y-1.5 overflow-y-auto border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600">
                      {referenceLogsPatchMinor.length === 0 ? (
                        <li className="py-2 text-zinc-500">
                          참고할 Patch/Minor가 없습니다.
                        </li>
                      ) : (
                        referenceLogsPatchMinor.map((log) => {
                          const t = getLogType(log);
                          return (
                            <li
                              key={log.id}
                              className="break-words border-b border-zinc-100 pb-1.5 last:border-0"
                            >
                              <span className="font-mono text-[11px] text-zinc-500">
                                {log.date}
                              </span>
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
            )}

            <div className="border-t border-zinc-100 pt-4">
              <p className="text-xs font-semibold text-zinc-700">이전 구간</p>
              <ul className="mt-3 space-y-3">
                {majorLogs.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-6 text-center text-sm text-zinc-500">
                    아직 남긴 Major가 없어요.
                  </li>
                ) : (
                  majorLogs.map((log) => (
                    <li key={log.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 px-3 py-3 text-zinc-800">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-950">
                          Major
                        </span>
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
          </div>
        ) : null}

        {effectiveTab === "profile" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
                title={`이 토픽의 누적: Major ${versionCounts.major}, Minor ${versionCounts.minor}, Patch ${versionCounts.patch}`}
              >
                {versionLabel}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm text-zinc-700">
              <p className="font-semibold text-zinc-900">Profile / Blog</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                이 영역은 추후 “초록북 안에서 만들어진 생각과 글 전시”로 확장될 예정이에요.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Link
                  href="/blog"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                  Blog 열기
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <nav
        aria-label="Topic 하단 네비게이션"
        className="mt-6 border-t border-zinc-100 pt-4"
      >
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setTab("patch")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              effectiveTab === "patch"
                ? "bg-emerald-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Patch
          </button>
          <button
            type="button"
            onClick={() => setTab("minor")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              effectiveTab === "minor"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Minor
          </button>
          <button
            type="button"
            onClick={() => setTab("major")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              effectiveTab === "major"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Major
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              effectiveTab === "profile"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Profile
          </button>
        </div>
      </nav>
    </section>
  );
}
