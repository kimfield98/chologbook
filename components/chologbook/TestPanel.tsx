"use client";

import type { Dispatch, SetStateAction } from "react";
import { hasLogForDate } from "@/lib/chologbook/date-logic";
import type { Topic } from "@/lib/chologbook/types";

export type TestPanelProps = {
  isTestMode: boolean;
  setIsTestMode: (v: boolean) => void;
  testPanelOpen: boolean;
  setTestPanelOpen: Dispatch<SetStateAction<boolean>>;
  selectedTopicId: string | null;
  selectedTopic: Topic | undefined;
  todayKey: string;
  onTestAddToday: () => void;
  onTestAddPastDay: () => void;
  onTestForceMinor: () => void;
  onTestReset: () => void;
};

export function TestPanel({
  isTestMode,
  setIsTestMode,
  testPanelOpen,
  setTestPanelOpen,
  selectedTopicId,
  selectedTopic,
  todayKey,
  onTestAddToday,
  onTestAddPastDay,
  onTestForceMinor,
  onTestReset,
}: TestPanelProps) {
  const todayBlocked =
    selectedTopic != null &&
    todayKey !== "" &&
    hasLogForDate(selectedTopic.logs, todayKey);

  if (!isTestMode) {
    return (
      <button
        type="button"
        onClick={() => setIsTestMode(true)}
        className="fixed bottom-4 left-4 z-50 rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50"
      >
        테스트 모드 켜기
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {testPanelOpen ? (
        <div className="w-64 rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-lg ring-1 ring-zinc-100">
          <p className="mb-2 text-xs font-medium text-zinc-500">테스트 도구</p>
          {!selectedTopicId ? (
            <p className="mb-2 text-xs text-amber-700">
              Topic을 선택한 뒤 사용할 수 있어요.
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!selectedTopicId || !todayKey || todayBlocked}
              onClick={onTestAddToday}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-800 enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              오늘 기록 추가
            </button>
            <button
              type="button"
              disabled={!selectedTopicId}
              onClick={onTestAddPastDay}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-800 enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + 하루 추가
            </button>
            <button
              type="button"
              disabled={!selectedTopicId}
              onClick={onTestForceMinor}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-800 enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              💭 Minor 테스트
            </button>
            <button
              type="button"
              disabled={!selectedTopicId}
              onClick={onTestReset}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left font-medium text-red-800 enabled:hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              초기화
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsTestMode(false)}
            className="mt-3 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
          >
            테스트 모드 끄기
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setTestPanelOpen((o) => !o)}
        className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-md ring-1 ring-zinc-100 hover:bg-zinc-50"
      >
        🛠 테스트
      </button>
    </div>
  );
}
