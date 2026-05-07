import { FirebaseError } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { initFirebase, db as firestoreDb } from "@/lib/firebase";
import type { Topic } from "@/lib/chologbook/types";

function ensureDb() {
  const d = firestoreDb ?? initFirebase();
  return d;
}

/** `logs`와 동일한 uid 기준으로, 토픽은 사용자 하위 경로에만 둔다(규칙을 `users/{userId}/...` 한 블록으로 묶기 쉬움). */
function topicsCollectionRef(db: NonNullable<ReturnType<typeof ensureDb>>, userId: string) {
  return collection(db, "users", userId, "topics");
}

export async function getTopicsFromFirestore(userId: string): Promise<Topic[]> {
  const db = ensureDb();
  if (!db || !userId.trim()) {
    return [];
  }

  try {
    const snap = await getDocs(topicsCollectionRef(db, userId));
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
      return [];
    }
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
    const ref = doc(db, "users", userId, "topics", topic.id);
    await setDoc(ref, {
      id: topic.id,
      userId,
      title: topic.title,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
    } else {
    }
    throw e;
  }
}

export async function deleteTopicFromFirestore(
  userId: string,
  topicId: string,
): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  if (!userId.trim()) {
    throw new Error("userId 없이 Firestore에서 Topic을 삭제할 수 없습니다.");
  }
  if (!topicId.trim()) {
    throw new Error("topicId 없이 Firestore에서 Topic을 삭제할 수 없습니다.");
  }

  const ref = doc(db, "users", userId, "topics", topicId);
  await deleteDoc(ref);
}
