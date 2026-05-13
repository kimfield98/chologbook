"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MemoTag } from "@/lib/memo/types";
import {
  deleteMemoFromFirestore,
  getMemoFromFirestore,
  listMemosFromFirestore,
  upsertMemoToFirestore,
  type FirestoreMemo,
} from "@/lib/memo/firestoreMemos";
import { normalizeMemoTag } from "@/lib/memo/memoTag";
import { initFirebase, isFirebaseConfigured } from "@/lib/firebase";

type UseMemosOptions = {
  dataUserId: string;
};

export type MemoDraftInput = {
  title: string;
  summary: string;
  tag: MemoTag;
  contentMd: string;
};

function makeLocalSummary(md: string): string {
  const s = md
    .replace(/\r\n/g, "\n")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[*_#>`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.slice(0, 80);
}

export function useMemos({ dataUserId }: UseMemosOptions) {
  const firebaseOn = isFirebaseConfigured();
  const uid = dataUserId.trim();

  const [memos, setMemos] = useState<FirestoreMemo[]>([]);
  const memosRef = useRef(memos);
  useEffect(() => {
    memosRef.current = memos;
  }, [memos]);

  const [isLoading, setIsLoading] = useState(() => firebaseOn);

  useEffect(() => {
    if (!firebaseOn || !uid) {
      queueMicrotask(() => {
        setMemos([]);
        memosRef.current = [];
        setIsLoading(false);
      });
      return;
    }

    initFirebase();
    setIsLoading(true);
    let cancelled = false;
    void listMemosFromFirestore(uid).then((rows) => {
      if (cancelled) return;
      setMemos(rows);
      memosRef.current = rows;
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [firebaseOn, uid]);

  const getById = useCallback(
    async (memoId: string) => {
      if (!firebaseOn || !uid) return null;
      initFirebase();
      return await getMemoFromFirestore(uid, memoId);
    },
    [firebaseOn, uid],
  );

  const upsert = useCallback(
    async (memoId: string, draft: MemoDraftInput) => {
      if (!firebaseOn || !uid) return;

      const title = draft.title.trim();
      const contentMd = draft.contentMd.trim();
      if (!title || !contentMd) return;

      const payload = {
        ...draft,
        title,
        contentMd,
        summary: draft.summary.trim() || makeLocalSummary(contentMd),
        tag: normalizeMemoTag(draft.tag),
      };

      const prev = memosRef.current;
      const optimistic: FirestoreMemo = {
        id: memoId,
        uid,
        title: payload.title,
        summary: payload.summary,
        tag: payload.tag,
        contentMd: payload.contentMd,
      };
      setMemos(() => {
        const rest = prev.filter((memo) => memo.id !== memoId);
        return [optimistic, ...rest];
      });
      memosRef.current = [optimistic, ...prev.filter((memo) => memo.id !== memoId)];

      initFirebase();
      await upsertMemoToFirestore({
        uid,
        memoId,
        title: payload.title,
        summary: payload.summary,
        tag: payload.tag,
        contentMd: payload.contentMd,
      });
    },
    [firebaseOn, uid],
  );

  const remove = useCallback(
    async (memoId: string) => {
      if (!firebaseOn || !uid) return;

      const prev = memosRef.current;
      setMemos(prev.filter((memo) => memo.id !== memoId));
      memosRef.current = prev.filter((memo) => memo.id !== memoId);

      initFirebase();
      await deleteMemoFromFirestore({ uid, memoId });
    },
    [firebaseOn, uid],
  );

  const tags = useMemo(() => {
    const map = new Map<string, string>();
    for (const memo of memos) {
      const tag = normalizeMemoTag(memo.tag);
      if (!tag) continue;
      const key = tag.toLocaleLowerCase("ko-KR");
      if (!map.has(key)) map.set(key, tag);
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "ko-KR"));
  }, [memos]);

  return {
    firebaseOn,
    uid,
    memos,
    setMemos,
    isLoading,
    tags,
    getById,
    upsert,
    remove,
  };
}

export type MemosApi = ReturnType<typeof useMemos>;
