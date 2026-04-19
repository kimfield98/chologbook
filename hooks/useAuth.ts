"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { auth, initFirebase, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Firebase 익명 인증 — 로그인 UI 없이 uid 부여.
 * env 미설정 시 user는 null, isLoading은 즉시 false.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  /** Firebase 사용 시 Auth 완료 전까지 true (SSR/클라이언트 동일하게 env 기준) */
  const [isLoading, setIsLoading] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isFirebaseConfigured()) {
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      return;
    }

    initFirebase();
    const a = auth;
    if (!a) {
      console.error("[useAuth] auth 초기화 실패");
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      return;
    }

    const unsub = onAuthStateChanged(a, async (nextUser) => {
      if (nextUser) {
        console.log("[useAuth] Firebase uid 확정", { uid: nextUser.uid });
        setUser(nextUser);
        setIsLoading(false);
        return;
      }

      try {
        console.log("[useAuth] 익명 로그인 시도 (기존 세션 없음)");
        await signInAnonymously(a);
      } catch (e) {
        console.error("[useAuth] 익명 로그인 실패", e);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return {
    user,
    userId: user?.uid,
    isLoading,
  };
}

export type AuthSession = ReturnType<typeof useAuth>;
