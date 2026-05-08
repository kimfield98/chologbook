"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BlogEditor, type BlogEditorValue } from "@/components/blog/BlogEditor";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";

function newPostId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TourBlogNewPage() {
  const router = useRouter();
  const authSession = useAuth();
  const { upsert } = useBlogPosts({ dataUserId: PUBLIC_OWNER_UID });

  const postId = useMemo(() => newPostId(), []);

  const [value, setValue] = useState<BlogEditorValue>({
    title: "",
    summary: "",
    category: "life",
    contentMd: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = authSession.userId !== PUBLIC_OWNER_UID;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">새 글</p>
            <p className="mt-1 text-sm text-zinc-600">
              {readOnly ? "운영자만 작성할 수 있어요." : "메모장처럼 적어주세요."}
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || isSaving}
            onClick={async () => {
              if (readOnly) return;
              setIsSaving(true);
              try {
                await upsert(postId, value);
                router.replace(`/tour/blog/${postId}`);
              } finally {
                setIsSaving(false);
              }
            }}
            className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
              readOnly || isSaving
                ? "border border-zinc-200 bg-zinc-100 text-zinc-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isSaving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <BlogEditor value={value} onChange={setValue} />
    </section>
  );
}

