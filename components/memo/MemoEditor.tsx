"use client";

import { useEffect, useState } from "react";
import { renderMarkdownToHtml } from "@/lib/memo/markdownClient";
import { normalizeMemoTag } from "@/lib/memo/memoTag";

export type MemoEditorValue = {
  title: string;
  summary: string;
  tag: string;
  contentMd: string;
};

export function MemoEditor({
  value,
  onChange,
}: {
  value: MemoEditorValue;
  onChange: (next: MemoEditorValue) => void;
}) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsPreviewLoading(true);
    void renderMarkdownToHtml(value.contentMd).then((html) => {
      if (cancelled) return;
      setPreviewHtml(html);
      setIsPreviewLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [value.contentMd]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900">메모</p>
        </div>

        <div className="mt-4 grid min-w-0 gap-3">
          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">제목</span>
            <input
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="제목"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </label>

          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">태그</span>
            <input
              value={value.tag}
              onChange={(e) => onChange({ ...value, tag: e.target.value })}
              onBlur={() =>
                onChange({
                  ...value,
                  tag: normalizeMemoTag(value.tag),
                })
              }
              placeholder="떠오른 영감을 묶을 이름"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </label>

          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">요약</span>
            <input
              value={value.summary}
              onChange={(e) => onChange({ ...value, summary: e.target.value })}
              placeholder="목록에 보일 한 줄"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </label>

          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">본문</span>
            <textarea
              value={value.contentMd}
              onChange={(e) => onChange({ ...value, contentMd: e.target.value })}
              rows={12}
              className="min-h-[220px] w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">미리보기</p>
        {isPreviewLoading ? (
          <p className="mt-3 text-sm text-zinc-500">렌더링 중…</p>
        ) : (
          <article
            className="prose prose-zinc mt-4 max-w-none prose-p:leading-relaxed prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </div>
  );
}
