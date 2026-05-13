"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BlogEditor, type BlogEditorValue } from "@/components/blog/BlogEditor";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { isBlogDraftPublishable } from "@/lib/blog/validateBlogDraft";
import { primaryCtaCompact } from "@/lib/ui/appButtonStyles";

export default function AppBlogEditPage({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();
  const postId = params.postId;

  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { posts, getById, upsert } = useBlogPosts({ dataUserId: uid });

  const cached = useMemo(
    () => posts.find((p) => p.id === postId) ?? null,
    [posts, postId],
  );

  const [value, setValue] = useState<BlogEditorValue>({
    title: cached?.title ?? "",
    summary: cached?.summary ?? "",
    category: cached?.category ?? "life",
    contentMd: cached?.contentMd ?? "",
    coverImageUrl: cached?.coverImageUrl,
  });
  const [isLoading, setIsLoading] = useState(!cached);
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = !authSession.userId;
  const canPublish = isBlogDraftPublishable(value);

  useEffect(() => {
    let cancelled = false;
    if (cached) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void (async () => {
      const row = await getById(postId);
      if (cancelled) return;
      if (row) {
        setValue({
          title: row.title,
          summary: row.summary,
          category: row.category,
          contentMd: row.contentMd,
          coverImageUrl: row.coverImageUrl,
        });
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cached, getById, postId]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">편집</p>
            <p className="mt-1 text-sm text-zinc-600">
              {readOnly ? "로그인 후 편집할 수 있어요." : "수정 내용을 게시하면 바로 반영돼요."}
            </p>
            <div className="mt-2">
              <Link
                href={`/p/${postId}`}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
              >
                ← 상세로
              </Link>
            </div>
          </div>
          <button
            type="button"
            disabled={readOnly || isSaving || isLoading || !canPublish}
            onClick={async () => {
              if (readOnly || !canPublish) return;
              setIsSaving(true);
              try {
                await upsert(postId, value);
                router.replace(`/p/${postId}`);
              } finally {
                setIsSaving(false);
              }
            }}
            className={
              readOnly || isSaving || isLoading || !canPublish
                ? "shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-400"
                : primaryCtaCompact
            }
          >
            {isLoading ? "불러오는 중…" : isSaving ? "게시 중…" : "게시"}
          </button>
        </div>
      </div>

      <BlogEditor value={value} onChange={setValue} />
    </section>
  );
}
