"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth, initFirebase, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Firebase 익명 인증(기본) + 선택적 Google 로그인.
 * Google 로그인 시 새 uid로 전환되며(데이터 분리), onAuthStateChanged로 user 동기화.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  /** Firebase 사용 시 Auth 완료 전까지 true (SSR/클라이언트 동일하게 env 기준) */
  const [isLoading, setIsLoading] = useState(() => isFirebaseConfigured());
  const [isGooglePopupPending, setIsGooglePopupPending] = useState(false);
  /** Google 팝업 진행 중 null 이벤트 시 익명 자동 로그인이 끼어들지 않도록 */
  const googlePopupPendingRef = useRef(false);

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
        console.log("[useAuth] Firebase uid 확정", {
          uid: nextUser.uid,
          isAnonymous: nextUser.isAnonymous,
          email: nextUser.email,
        });
        setUser(nextUser);
        setIsLoading(false);
        return;
      }

      if (googlePopupPendingRef.current) {
        console.log("[useAuth] Google 팝업 진행 중 — 익명 자동 로그인 스킵");
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

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      console.warn("[useAuth] Firebase 미설정 — Google 로그인 불가");
      return;
    }

    initFirebase();
    const a = auth;
    if (!a) {
      console.error("[useAuth] Google 로그인: auth 없음");
      return;
    }

    googlePopupPendingRef.current = true;
    setIsGooglePopupPending(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(a, provider);
      console.log("[useAuth] Google 로그인 완료 (새 uid 기준 데이터)");
    } catch (e) {
      console.error("[useAuth] Google 로그인 실패", e);
    } finally {
      googlePopupPendingRef.current = false;
      setIsGooglePopupPending(false);
    }
  }, []);

  const isAnonymous = user?.isAnonymous ?? false;

  return {
    user,
    userId: user?.uid,
    isLoading,
    isAnonymous,
    isGooglePopupPending,
    signInWithGoogle,
  };
}

export type AuthSession = ReturnType<typeof useAuth>;
