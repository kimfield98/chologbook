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

  try {
    const ref = doc(db, "logs", log.id);
    const payload = {
      id: log.id,
      topicId: log.topicId,
      date: log.date,
      text: log.text,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (e) {
    console.error("[firestoreLogs] addLogToFirestore failed", e);
    throw e;
  }
}

/** 컬렉션 전체를 읽어 앱 `Log[]`로 변환 (createdAt 기준 정렬) */
export async function getLogsFromFirestore(): Promise<Log[]> {
  const db = ensureDb();
  if (!db) {
    return [];
  }

  try {
    const snap = await getDocs(collection(db, "logs"));
    const rows = snap.docs.map((d) => {
      const data = d.data() as {
        id?: string;
        topicId?: string;
        date?: string;
        text?: string;
        createdAt?: Timestamp;
      };
      return {
        id: typeof data.id === "string" ? data.id : d.id,
        topicId: String(data.topicId ?? ""),
        date: String(data.date ?? ""),
        text: String(data.text ?? ""),
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

    return rows.map(({ id, topicId, date, text }) => ({
      id,
      topicId,
      date,
      text,
    }));
  } catch (e) {
    console.error("[firestoreLogs] getLogsFromFirestore failed", e);
    throw e;
  }
}

/** topicId가 일치하는 문서를 모두 삭제 */
export async function clearLogsByTopic(topicId: string): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }

  try {
    const q = query(collection(db, "logs"), where("topicId", "==", topicId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    console.error("[firestoreLogs] clearLogsByTopic failed", e);
    throw e;
  }
}
