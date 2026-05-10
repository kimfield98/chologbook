"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { BLOG_CATEGORIES, BLOG_CATEGORY_ALL } from "@/lib/blog/constants";
import type { BlogCategory } from "@/lib/blog/types";

export default function AppBlogIndexClient({
  initialCategory,
}: {
  initialCategory?: string;
}) {
  const { authSession } = useAppContext();
  const uid = authSession.userId ?? "";
  const { posts, isLoading } = useBlogPosts({ dataUserId: uid });

  const selected = useMemo(() => {
    const c = initialCategory;
    if (!c) return BLOG_CATEGORY_ALL;
    if (c === BLOG_CATEGORY_ALL) return BLOG_CATEGORY_ALL;
    return BLOG_CATEGORIES.some((x) => x.key === c) ? (c as BlogCategory) : BLOG_CATEGORY_ALL;
  }, [initialCategory]);

  const filtered =
    selected === BLOG_CATEGORY_ALL
      ? posts
      : posts.filter((p) => p.category === selected);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Blog</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          내 글을 모아둔 곳이에요.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/app/blog"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected === BLOG_CATEGORY_ALL
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            전체
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/app/blog?c=${cat.key}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selected === cat.key
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <div className="mt-4">
          <Link
            href="/app/blog/new"
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-800"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <ul className="divide-y divide-zinc-100">
          {isLoading ? (
            <li className="px-5 py-8 text-center text-sm text-zinc-500">
              불러오는 중…
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-zinc-600">
              아직 작성된 글이 없어요.
            </li>
          ) : (
            filtered.map((p) => {
              const catLabel =
                BLOG_CATEGORIES.find((c) => c.key === p.category)?.label ??
                p.category;
              return (
                <li key={p.id}>
                  <Link
                    href={`/p/${p.id}`}
                    className="block px-5 py-4 transition hover:bg-zinc-50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
                        {p.title}
                      </p>
                      <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                        {catLabel}
                      </span>
                    </div>
                    <p className="mt-1 min-w-0 truncate text-xs text-zinc-500">
                      {p.summary}
                    </p>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
