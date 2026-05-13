"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MemoEditor, type MemoEditorValue } from "@/components/memo/MemoEditor";
import { useMemos } from "@/hooks/useMemos";
import { isMemoDraftSavable } from "@/lib/memo/validateMemoDraft";
import { primaryCtaCompact } from "@/lib/ui/appButtonStyles";

export default function AppMemoEditPage({
  params,
}: {
  params: { memoId: string };
}) {
  const router = useRouter();
  const memoId = params.memoId;

  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { memos, getById, upsert } = useMemos({ dataUserId: uid });

  const cached = useMemo(
    () => memos.find((memo) => memo.id === memoId) ?? null,
    [memos, memoId],
  );

  const [value, setValue] = useState<MemoEditorValue>({
    title: cached?.title ?? "",
    summary: cached?.summary ?? "",
    tag: cached?.tag ?? "",
    contentMd: cached?.contentMd ?? "",
  });
  const [isLoading, setIsLoading] = useState(!cached);
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = !authSession.userId;
  const canSave = isMemoDraftSavable(value);

  useEffect(() => {
    let cancelled = false;
    if (cached) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void (async () => {
      const row = await getById(memoId);
      if (cancelled) return;
      if (row) {
        setValue({
          title: row.title,
          summary: row.summary,
          tag: row.tag,
          contentMd: row.contentMd,
        });
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cached, getById, memoId]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">메모 편집</p>
            <p className="mt-1 text-sm text-zinc-600">
              {readOnly ? "로그인 후 편집할 수 있어요." : "수정 내용을 저장하면 바로 반영돼요."}
            </p>
            <div className="mt-2">
              <Link
                href={`/app/memo/${memoId}`}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
              >
                ← 상세로
              </Link>
            </div>
          </div>
          <button
            type="button"
            disabled={readOnly || isSaving || isLoading || !canSave}
            onClick={async () => {
              if (readOnly || !canSave) return;
              setIsSaving(true);
              try {
                await upsert(memoId, value);
                router.replace(`/app/memo/${memoId}`);
              } finally {
                setIsSaving(false);
              }
            }}
            className={
              readOnly || isSaving || isLoading || !canSave
                ? "shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-400"
                : primaryCtaCompact
            }
          >
            {isLoading ? "불러오는 중…" : isSaving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <MemoEditor value={value} onChange={setValue} />
    </section>
  );
}
