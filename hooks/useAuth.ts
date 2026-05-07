"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth, initFirebase, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Firebase Google 로그인(선택) 기반.
 * 익명 로그인은 사용하지 않는다.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  /** Firebase 사용 시 Auth 완료 전까지 true (SSR/클라이언트 동일하게 env 기준) */
  const [isLoading, setIsLoading] = useState(() => isFirebaseConfigured());
  const [isGooglePopupPending, setIsGooglePopupPending] = useState(false);
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
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      return;
    }

    const unsub = onAuthStateChanged(a, async (nextUser) => {
      if (nextUser) {
        setUser(nextUser);
        setIsLoading(false);
        return;
      }

      if (googlePopupPendingRef.current) {
        return;
      }

      setUser(null);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      return;
    }

    initFirebase();
    const a = auth;
    if (!a) {
      return;
    }

    googlePopupPendingRef.current = true;
    setIsGooglePopupPending(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(a, provider);
    } catch {
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
