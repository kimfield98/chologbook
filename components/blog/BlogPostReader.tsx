"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { BLOG_CATEGORIES } from "@/lib/blog/constants";
import { renderMarkdownToHtml } from "@/lib/blog/markdownClient";
import { useBlogPosts } from "@/hooks/useBlogPosts";

type BlogPostReaderProps = {
  postId: string;
  /** 목록으로 돌아갈 때 사용하는 경로 */
  listHref?: string;
};

/**
 * 앱 셸 밖에서 쓰는 블로그 글 읽기 화면(전체 뷰 + 목록/뒤로).
 */
export function BlogPostReader({
  postId,
  listHref = "/app/blog",
}: BlogPostReaderProps) {
  const router = useRouter();
  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { posts, getById, remove } = useBlogPosts({ dataUserId: uid });

  const cached = useMemo(
    () => posts.find((p) => p.id === postId) ?? null,
    [posts, postId],
  );

  const [post, setPost] = useState(cached);
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(!cached);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authSession.isLoading) return;
    if (!authSession.userId) {
      router.replace("/");
    }
  }, [authSession.isLoading, authSession.userId, router]);

  const readOnly =
    !authSession.userId || !post || post.uid !== authSession.userId;

  useEffect(() => {
    if (!authSession.userId) return;
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
  }, [authSession.userId, cached, getById, postId]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = menuWrapRef.current;
      if (el && !el.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const catLabel =
    post?.category
      ? BLOG_CATEGORIES.find((c) => c.key === post.category)?.label ??
        post.category
      : "";

  if (authSession.isLoading || !authSession.userId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            뒤로
          </button>
          <span className="text-zinc-300" aria-hidden>
            |
          </span>
          <Link
            href={listHref}
            className="rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            목록
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                {isLoading ? "불러오는 중…" : post?.title ?? "글을 찾을 수 없어요."}
              </p>
              {post ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                    {catLabel}
                  </span>
                </div>
              ) : null}
            </div>

            {!readOnly && post ? (
              <div className="relative shrink-0" ref={menuWrapRef}>
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="글 메뉴"
                  disabled={isDeleting}
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-40"
                >
                  <span aria-hidden>⋮</span>
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
                  >
                    <Link
                      role="menuitem"
                      href={`/app/blog/${postId}/edit`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                    >
                      편집
                    </Link>
                    <div className="h-px bg-zinc-100" />
                    <button
                      role="menuitem"
                      type="button"
                      disabled={isDeleting}
                      onClick={async () => {
                        if (isDeleting) return;
                        setMenuOpen(false);
                        const ok = window.confirm("이 글을 진짜 삭제할까요?");
                        if (!ok) return;
                        setIsDeleting(true);
                        try {
                          await remove(postId);
                          router.replace(listHref);
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:text-zinc-400"
                    >
                      {isDeleting ? "삭제 중…" : "삭제"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {post?.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">{post.summary}</p>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {!post ? (
            <p className="text-sm text-zinc-500">글이 없거나 권한이 없어요.</p>
          ) : (
            <article
              className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
