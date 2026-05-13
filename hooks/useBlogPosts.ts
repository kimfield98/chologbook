"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BlogCategory } from "@/lib/blog/types";
import {
  deleteBlogPostFromFirestore,
  getBlogPostFromFirestore,
  listBlogPostsFromFirestore,
  upsertBlogPostToFirestore,
  type FirestoreBlogPost,
} from "@/lib/blog/firestoreBlogPosts";
import { initFirebase, isFirebaseConfigured } from "@/lib/firebase";

type UseBlogPostsOptions = {
  /** 모드에 따른 데이터 주체(uid) */
  dataUserId: string;
};

export type BlogPostDraftInput = {
  title: string;
  summary: string;
  category: BlogCategory;
  contentMd: string;
  coverImageUrl?: string;
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

export function useBlogPosts({ dataUserId }: UseBlogPostsOptions) {
  const firebaseOn = isFirebaseConfigured();
  const uid = dataUserId.trim();

  const [posts, setPosts] = useState<FirestoreBlogPost[]>([]);
  const postsRef = useRef(posts);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const [isLoading, setIsLoading] = useState(() => firebaseOn);

  useEffect(() => {
    if (!firebaseOn || !uid) {
      queueMicrotask(() => {
        setPosts([]);
        postsRef.current = [];
        setIsLoading(false);
      });
      return;
    }

    initFirebase();
    setIsLoading(true);
    let cancelled = false;
    void listBlogPostsFromFirestore(uid).then((rows) => {
      if (cancelled) return;
      setPosts(rows);
      postsRef.current = rows;
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [firebaseOn, uid]);

  const getById = useCallback(
    async (postId: string) => {
      if (!firebaseOn || !uid) return null;
      initFirebase();
      return await getBlogPostFromFirestore(uid, postId);
    },
    [firebaseOn, uid],
  );

  const upsert = useCallback(
    async (postId: string, draft: BlogPostDraftInput) => {
      if (!firebaseOn || !uid) return;

      const title = draft.title.trim();
      const contentMd = draft.contentMd.trim();
      if (!title || !contentMd) return;

      const payload = {
        ...draft,
        title,
        contentMd,
        summary: draft.summary.trim() || makeLocalSummary(contentMd),
      };

      const prev = postsRef.current;
      const optimistic: FirestoreBlogPost = {
        id: postId,
        uid,
        title: payload.title,
        summary: payload.summary,
        category: payload.category,
        contentMd: payload.contentMd,
        coverImageUrl: payload.coverImageUrl,
      };
      setPosts(() => {
        const rest = prev.filter((p) => p.id !== postId);
        return [optimistic, ...rest];
      });
      postsRef.current = [optimistic, ...prev.filter((p) => p.id !== postId)];

      initFirebase();
      await upsertBlogPostToFirestore({
        uid,
        postId,
        title: payload.title,
        summary: payload.summary,
        category: payload.category,
        contentMd: payload.contentMd,
        coverImageUrl: payload.coverImageUrl,
      });
    },
    [firebaseOn, uid],
  );

  const remove = useCallback(
    async (postId: string) => {
      if (!firebaseOn || !uid) return;

      const prev = postsRef.current;
      setPosts(prev.filter((p) => p.id !== postId));
      postsRef.current = prev.filter((p) => p.id !== postId);

      initFirebase();
      await deleteBlogPostFromFirestore({ uid, postId });
    },
    [firebaseOn, uid],
  );

  const categories = useMemo(() => {
    const set = new Set<BlogCategory>();
    for (const p of posts) set.add(p.category);
    return Array.from(set);
  }, [posts]);

  return {
    firebaseOn,
    uid,
    posts,
    setPosts,
    isLoading,
    categories,
    getById,
    upsert,
    remove,
  };
}

export type BlogPostsApi = ReturnType<typeof useBlogPosts>;

