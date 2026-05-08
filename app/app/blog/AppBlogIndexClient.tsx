"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { BLOG_CATEGORIES, BLOG_CATEGORY_ALL } from "@/lib/blog/constants";
import type { BlogCategory } from "@/lib/blog/types";
import { PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";

export default function AppBlogIndexClient({ initialCategory }: { initialCategory?: string }) {
  const { authSession } = useAppContext();
  const { posts, isLoading } = useBlogPosts({ dataUserId: PUBLIC_OWNER_UID });
  const isOwner = authSession.userId === PUBLIC_OWNER_UID;

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Blog</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              운영자의 글을 전시합니다.
            </p>
          </div>
          {isOwner ? (
            <Link
              href="/app/blog/new"
              className="shrink-0 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              글쓰기
            </Link>
          ) : (
            <span className="shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-500">
              읽기 전용
            </span>
          )}
        </div>

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
                    href={`/app/blog/${p.id}`}
                    className="block px-5 py-4 transition hover:bg-emerald-50/20"
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

