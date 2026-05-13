"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppContext } from "@/app/app/AppContext";
import { useMemos } from "@/hooks/useMemos";
import { MEMO_TAG_ALL } from "@/lib/memo/constants";
import { displayMemoTag, matchesMemoTagFilter } from "@/lib/memo/memoTag";

function tagHref(tag?: string) {
  if (!tag || tag === MEMO_TAG_ALL) return "/app/memo";
  return `/app/memo?t=${encodeURIComponent(tag)}`;
}

export default function AppMemoIndexClient({
  initialTag,
}: {
  initialTag?: string;
}) {
  const { authSession } = useAppContext();
  const uid = authSession.userId ?? "";
  const { memos, tags, isLoading } = useMemos({ dataUserId: uid });
  const [tagQuery, setTagQuery] = useState("");

  const selectedTag = useMemo(() => {
    const tag = initialTag?.trim();
    if (!tag || tag === MEMO_TAG_ALL) return MEMO_TAG_ALL;
    const match = tags.find((item) => matchesMemoTagFilter(item, tag));
    return match ?? MEMO_TAG_ALL;
  }, [initialTag, tags]);

  const visibleTags = useMemo(() => {
    const query = tagQuery.trim().toLocaleLowerCase("ko-KR");
    if (!query) return tags;
    return tags.filter((tag) => tag.toLocaleLowerCase("ko-KR").includes(query));
  }, [tagQuery, tags]);

  const filtered =
    selectedTag === MEMO_TAG_ALL
      ? memos
      : memos.filter((memo) => matchesMemoTagFilter(memo.tag, selectedTag));

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Memo</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          글을 완성하기 전, 떠오른 영감을 남겨 두는 공간이에요.
        </p>

        <div className="mt-4 space-y-3">
          {tags.length > 0 ? (
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-600">태그 검색</span>
              <input
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="태그 이름으로 찾기"
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
              />
            </label>
          ) : null}

          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full gap-2">
              <Link
                href={tagHref()}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedTag === MEMO_TAG_ALL
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                전체
              </Link>
              {visibleTags.map((tag) => (
                <Link
                  key={tag}
                  href={tagHref(tag)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    selectedTag === tag
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {tags.length > 0 && visibleTags.length === 0 ? (
            <p className="text-xs text-zinc-500">검색과 맞는 태그가 없어요.</p>
          ) : null}
        </div>

        <div className="mt-4">
          <Link
            href="/app/memo/new"
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-800"
          >
            메모 남기기
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
              아직 남긴 메모가 없어요.
            </li>
          ) : (
            filtered.map((memo) => {
              const tagLabel = displayMemoTag(memo.tag);
              return (
                <li key={memo.id}>
                  <Link
                    href={`/app/memo/${memo.id}`}
                    className="block px-5 py-4 transition hover:bg-zinc-50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
                        {memo.title}
                      </p>
                      {tagLabel ? (
                        <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                          {tagLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 min-w-0 truncate text-xs text-zinc-500">
                      {memo.summary}
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
