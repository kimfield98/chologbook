"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMemos } from "@/hooks/useMemos";
import { displayMemoTag } from "@/lib/memo/memoTag";
import { renderMarkdownToHtml } from "@/lib/memo/markdownClient";

type MemoReaderProps = {
  memoId: string;
  listHref?: string;
};

export function MemoReader({
  memoId,
  listHref = "/app/memo",
}: MemoReaderProps) {
  const router = useRouter();
  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { memos, getById, remove } = useMemos({ dataUserId: uid });

  const cached = useMemo(
    () => memos.find((memo) => memo.id === memoId) ?? null,
    [memos, memoId],
  );

  const [memo, setMemo] = useState(cached);
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
    !authSession.userId || !memo || memo.uid !== authSession.userId;

  useEffect(() => {
    if (!authSession.userId) return;
    let cancelled = false;
    setIsLoading(!cached);
    void (async () => {
      const row = cached ?? (await getById(memoId));
      if (cancelled) return;
      setMemo(row);
      setIsLoading(false);
      if (row) {
        const rendered = await renderMarkdownToHtml(row.contentMd);
        if (!cancelled) setHtml(rendered);
      } else {
        setHtml("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authSession.userId, cached, getById, memoId]);

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

  const tagLabel = displayMemoTag(memo?.tag);

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
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
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

      <main className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                {isLoading ? "불러오는 중…" : memo?.title ?? "메모를 찾을 수 없어요."}
              </p>
              {memo ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {tagLabel ? (
                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                      {tagLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!readOnly && memo ? (
              <div className="relative shrink-0" ref={menuWrapRef}>
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="메모 메뉴"
                  disabled={isDeleting}
                  onClick={() => setMenuOpen((open) => !open)}
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
                      href={`/app/memo/${memoId}/edit`}
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
                        const ok = window.confirm("이 메모를 삭제할까요?");
                        if (!ok) return;
                        setIsDeleting(true);
                        try {
                          await remove(memoId);
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

          {memo?.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">{memo.summary}</p>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {!memo ? (
            <p className="text-sm text-zinc-500">메모가 없거나 권한이 없어요.</p>
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
