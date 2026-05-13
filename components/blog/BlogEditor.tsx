"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogCategory } from "@/lib/blog/types";
import { BLOG_CATEGORIES } from "@/lib/blog/constants";
import { renderMarkdownToHtml } from "@/lib/blog/markdownClient";

export type BlogEditorValue = {
  title: string;
  summary: string;
  category: BlogCategory;
  contentMd: string;
  coverImageUrl?: string;
};

export function BlogEditor({
  value,
  onChange,
}: {
  value: BlogEditorValue;
  onChange: (next: BlogEditorValue) => void;
}) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const categoryOptions = useMemo(
    () => BLOG_CATEGORIES.map((c) => c.key),
    [],
  );

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
          <p className="text-sm font-semibold text-zinc-900">글</p>
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
            <span className="text-xs font-semibold text-zinc-600">
              카테고리
            </span>
            <div className="relative">
              <select
                value={value.category}
                onChange={(e) =>
                  onChange({
                    ...value,
                    category: e.target.value as BlogCategory,
                  })
                }
                className="h-11 w-full max-w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-10 text-sm text-zinc-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
              >
                {categoryOptions.map((k) => {
                  const label =
                    BLOG_CATEGORIES.find((c) => c.key === k)?.label ?? k;
                  return (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <span
                className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-zinc-400"
                aria-hidden
              >
                ▼
              </span>
            </div>
          </label>

          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">요약</span>
            <input
              value={value.summary}
              onChange={(e) => onChange({ ...value, summary: e.target.value })}
              placeholder="목록에 표시할 한 줄 소개"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </label>

          <label className="grid w-full min-w-0 gap-1">
            <span className="text-xs font-semibold text-zinc-600">본문</span>
            <textarea
              value={value.contentMd}
              onChange={(e) =>
                onChange({ ...value, contentMd: e.target.value })
              }
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

