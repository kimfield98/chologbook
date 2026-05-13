"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BlogEditor, type BlogEditorValue } from "@/components/blog/BlogEditor";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { isBlogDraftPublishable } from "@/lib/blog/validateBlogDraft";
import { primaryCtaCompact } from "@/lib/ui/appButtonStyles";

function newPostId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AppBlogNewPage() {
  const router = useRouter();
  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { upsert } = useBlogPosts({ dataUserId: uid });

  const postId = useMemo(() => newPostId(), []);

  const [value, setValue] = useState<BlogEditorValue>({
    title: "",
    summary: "",
    category: "life",
    contentMd: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = !authSession.userId;
  const canPublish = isBlogDraftPublishable(value);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">새 글</p>
            <p className="mt-1 text-sm text-zinc-600">
              {readOnly ? "로그인 후 작성할 수 있어요." : "제목과 본문을 입력하면 게시할 수 있어요."}
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || isSaving || !canPublish}
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
              readOnly || isSaving || !canPublish
                ? "shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-400"
                : primaryCtaCompact
            }
          >
            {isSaving ? "게시 중…" : "게시"}
          </button>
        </div>
      </div>

      <BlogEditor value={value} onChange={setValue} />
    </section>
  );
}
