import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { initFirebase, db as firestoreDb } from "@/lib/firebase";
import type { Topic } from "@/lib/chologbook/types";

function ensureDb() {
  const d = firestoreDb ?? initFirebase();
  return d;
}

export async function getTopicsFromFirestore(userId: string): Promise<Topic[]> {
  const db = ensureDb();
  if (!db || !userId.trim()) {
    return [];
  }

  try {
    const q = query(collection(db, "topics"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const rows: Topic[] = snap.docs.map((d) => {
      const data = d.data() as { id?: string; title?: string };
      return {
        id: typeof data.id === "string" ? data.id : d.id,
        title: String(data.title ?? "").trim() || "기록",
      };
    });
    rows.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    return rows;
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      console.warn(
        "[firestoreTopics] topics 컬렉션 읽기가 규칙에 막혔습니다. Firebase Console → Firestore → 규칙에서 본인 userId 기준 읽기를 허용해 주세요. (지금은 로그에서 토픽만 복구된 상태로 동작합니다.)",
      );
      return [];
    }
    console.warn(
      "[firestoreTopics] getTopicsFromFirestore 실패 — 토픽 목록 없이 진행합니다.",
      e,
    );
    return [];
  }
}

export async function addTopicToFirestore(
  userId: string,
  topic: Topic,
): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  if (!userId.trim()) {
    throw new Error("userId 없이 Firestore에 Topic을 저장할 수 없습니다.");
  }

  try {
    const ref = doc(db, "topics", topic.id);
    await setDoc(ref, {
      id: topic.id,
      userId,
      title: topic.title,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      console.warn(
        "[firestoreTopics] topics 쓰기가 규칙에 막혔습니다. Firestore 규칙에 topics 생성·수정을 추가해 주세요.",
      );
    } else {
      console.error("[firestoreTopics] addTopicToFirestore failed", e);
    }
    throw e;
  }
}
