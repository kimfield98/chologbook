"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readFirebaseConfigFromEnv(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let firebaseApp: FirebaseApp | null = null;

/** Firestore 인스턴스 — `initFirebase()` 이후에만 채워짐 */
export let db: Firestore | null = null;

/** 클라이언트에서 환경변수가 모두 있으면 true */
export function isFirebaseConfigured(): boolean {
  return readFirebaseConfigFromEnv() !== null;
}

/**
 * Firebase App + Firestore 초기화 (멱등).
 * 브라우저에서만 실행되며, env 미설정 시 null을 반환한다.
 */
export function initFirebase(): Firestore | null {
  if (typeof window === "undefined") return null;

  const cfg = readFirebaseConfigFromEnv();
  if (!cfg) return null;

  if (!getApps().length) {
    firebaseApp = initializeApp(cfg);
  } else {
    firebaseApp = getApp();
  }

  if (!db && firebaseApp) {
    db = getFirestore(firebaseApp);
  }

  return db;
}
