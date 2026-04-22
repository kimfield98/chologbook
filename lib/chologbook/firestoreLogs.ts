import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { initFirebase, db as firestoreDb } from "@/lib/firebase";
import type { Log } from "@/lib/chologbook/types";

function ensureDb() {
  const d = firestoreDb ?? initFirebase();
  return d;
}

/**
 * 단일 Log 문서 upsert (문서 id = log.id).
 */
export async function addLogToFirestore(log: Log): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }

  if (!log.userId?.trim()) {
    throw new Error("userId 없이 Firestore에 저장할 수 없습니다.");
  }

  console.log("[firestoreLogs] addLogToFirestore userId 포함", {
    userId: log.userId,
    topicId: log.topicId,
    id: log.id,
  });

  try {
    const ref = doc(db, "logs", log.id);
    const payload = {
      id: log.id,
      userId: log.userId,
      topicId: log.topicId,
      date: log.date,
      text: log.text,
      type: log.type ?? "patch",
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (e) {
    console.error("[firestoreLogs] addLogToFirestore failed", e);
    throw e;
  }
}

/** 해당 사용자의 logs만 조회 (전체 컬렉션 스캔 금지) */
export async function getLogsFromFirestore(userId: string): Promise<Log[]> {
  const db = ensureDb();
  if (!db) {
    return [];
  }

  if (!userId.trim()) {
    console.warn("[firestoreLogs] getLogsFromFirestore: userId 없음 — 빈 배열");
    return [];
  }

  console.log("[firestoreLogs] getLogsFromFirestore 쿼리", { userId });

  try {
    const q = query(collection(db, "logs"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => {
      const data = d.data() as {
        id?: string;
        userId?: string;
        topicId?: string;
        date?: string;
        text?: string;
        type?: string;
        createdAt?: Timestamp;
      };
      return {
        id: typeof data.id === "string" ? data.id : d.id,
        userId: String(data.userId ?? ""),
        topicId: String(data.topicId ?? ""),
        date: String(data.date ?? ""),
        text: String(data.text ?? ""),
        type: data.type === "minor" ? ("minor" as const) : undefined,
        createdAt: data.createdAt,
      };
    });

    rows.sort((a, b) => {
      const ta = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      if (ta !== tb) return ta - tb;
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.id.localeCompare(b.id);
    });

    return rows.map(({ id, userId: uid, topicId, date, text, type }) => {
      const log: Log = { id, userId: uid, topicId, date, text };
      if (type === "minor") log.type = "minor";
      return log;
    });
  } catch (e) {
    console.error("[firestoreLogs] getLogsFromFirestore failed", e);
    throw e;
  }
}

/** userId + topicId가 일치하는 문서만 삭제 */
export async function clearLogsByTopic(
  userId: string,
  topicId: string,
): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }

  if (!userId.trim()) {
    throw new Error("userId 없이 Firestore 삭제를 실행할 수 없습니다.");
  }

  try {
    const q = query(
      collection(db, "logs"),
      where("userId", "==", userId),
      where("topicId", "==", topicId),
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    console.error("[firestoreLogs] clearLogsByTopic failed", e);
    throw e;
  }
}
