"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MemoEditor, type MemoEditorValue } from "@/components/memo/MemoEditor";
import { useMemos } from "@/hooks/useMemos";
import { isMemoDraftSavable } from "@/lib/memo/validateMemoDraft";
import { primaryCtaCompact } from "@/lib/ui/appButtonStyles";

function newMemoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AppMemoNewPage() {
  const router = useRouter();
  const authSession = useAuth();
  const uid = authSession.userId ?? "";
  const { upsert } = useMemos({ dataUserId: uid });

  const memoId = useMemo(() => newMemoId(), []);

  const [value, setValue] = useState<MemoEditorValue>({
    title: "",
    summary: "",
    tag: "",
    contentMd: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = !authSession.userId;
  const canSave = isMemoDraftSavable(value);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">새 메모</p>
            <p className="mt-1 text-sm text-zinc-600">
              {readOnly ? "로그인 후 작성할 수 있어요." : "제목과 본문을 입력하면 저장할 수 있어요."}
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || isSaving || !canSave}
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
              readOnly || isSaving || !canSave
                ? "shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-400"
                : primaryCtaCompact
            }
          >
            {isSaving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <MemoEditor value={value} onChange={setValue} />
    </section>
  );
}
