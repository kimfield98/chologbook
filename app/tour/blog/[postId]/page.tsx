"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BLOG_CATEGORIES } from "@/lib/blog/constants";
import { renderMarkdownToHtml } from "@/lib/blog/markdownClient";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";

export default function TourBlogDetailPage({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();
  const authSession = useAuth();
  const { posts, getById, remove } = useBlogPosts({ dataUserId: PUBLIC_OWNER_UID });

  const postId = params.postId;
  const cached = useMemo(
    () => posts.find((p) => p.id === postId) ?? null,
    [posts, postId],
  );

  const [post, setPost] = useState(cached);
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(!cached);
  const [isDeleting, setIsDeleting] = useState(false);

  const readOnly = authSession.userId !== PUBLIC_OWNER_UID;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(!cached);
    void (async () => {
      const row = cached ?? (await getById(postId));
      if (cancelled) return;
      setPost(row);
      setIsLoading(false);
      if (row) {
        const h = await renderMarkdownToHtml(row.contentMd);
        if (!cancelled) setHtml(h);
      } else {
        setHtml("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cached, getById, postId]);

  const catLabel =
    post?.category
      ? BLOG_CATEGORIES.find((c) => c.key === post.category)?.label ?? post.category
      : "";

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/tour/blog"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
            >
              ← 목록
            </Link>
            <p className="mt-2 truncate text-lg font-semibold tracking-tight text-zinc-900">
              {isLoading ? "불러오는 중…" : post?.title ?? "글을 찾을 수 없어요."}
            </p>
            {post ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  {catLabel}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!readOnly && post ? (
              <>
                <Link
                  href={`/tour/blog/${postId}/edit`}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  편집
                </Link>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (isDeleting) return;
                    const ok = window.confirm("이 글을 진짜 삭제할까요?");
                    if (!ok) return;
                    setIsDeleting(true);
                    try {
                      await remove(postId);
                      router.replace("/tour/blog");
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isDeleting
                      ? "border border-zinc-200 bg-zinc-100 text-zinc-400"
                      : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  }`}
                >
                  {isDeleting ? "삭제 중…" : "삭제"}
                </button>
              </>
            ) : (
              <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                읽기 전용
              </span>
            )}
          </div>
        </div>

        {post?.summary ? (
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {post.summary}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        {!post ? (
          <p className="text-sm text-zinc-500">글이 없거나 권한이 없어요.</p>
        ) : (
          <article
            className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}

