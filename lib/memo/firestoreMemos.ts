import { FirebaseError } from "firebase/app";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db as firestoreDb, initFirebase } from "@/lib/firebase";
import { normalizeMemoTag } from "@/lib/memo/memoTag";
import type { MemoTag } from "@/lib/memo/types";

export type FirestoreMemo = {
  id: string;
  uid: string;
  title: string;
  summary: string;
  tag: MemoTag;
  contentMd: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type FirestoreMemoDoc = {
  uid?: string;
  title?: string;
  summary?: string;
  tag?: MemoTag;
  category?: MemoTag;
  contentMd?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function ensureDb() {
  return firestoreDb ?? initFirebase();
}

function memoPostsCollectionRef(
  db: NonNullable<ReturnType<typeof ensureDb>>,
  uid: string,
  collectionName: "memoPosts" | "blogPosts" = "memoPosts",
) {
  return collection(db, "users", uid, collectionName);
}

async function listMemosFromCollection(
  db: NonNullable<ReturnType<typeof ensureDb>>,
  uid: string,
  collectionName: "memoPosts" | "blogPosts",
): Promise<FirestoreMemo[]> {
  const q = query(memoPostsCollectionRef(db, uid, collectionName), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => coerceMemoDoc(uid, d.id, d.data() as FirestoreMemoDoc));
}

function coerceMemoDoc(
  uid: string,
  id: string,
  data: FirestoreMemoDoc,
): FirestoreMemo {
  const title = String(data.title ?? "").trim() || "제목 없음";
  const summary = String(data.summary ?? "").trim();
  const tag = normalizeMemoTag(String(data.tag ?? data.category ?? ""));
  const contentMd = String(data.contentMd ?? "");

  return {
    id,
    uid,
    title,
    summary,
    tag,
    contentMd,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listMemosFromFirestore(uid: string): Promise<FirestoreMemo[]> {
  const db = ensureDb();
  if (!db || !uid.trim()) return [];

  try {
    const memos = await listMemosFromCollection(db, uid, "memoPosts");
    if (memos.length > 0) return memos;
    return await listMemosFromCollection(db, uid, "blogPosts");
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      return [];
    }
    return [];
  }
}

export async function getMemoFromFirestore(
  uid: string,
  memoId: string,
): Promise<FirestoreMemo | null> {
  const db = ensureDb();
  if (!db || !uid.trim() || !memoId.trim()) return null;

  try {
    const memoRef = doc(db, "users", uid, "memoPosts", memoId);
    const memoSnap = await getDoc(memoRef);
    if (memoSnap.exists()) {
      return coerceMemoDoc(uid, memoSnap.id, memoSnap.data() as FirestoreMemoDoc);
    }

    const legacyRef = doc(db, "users", uid, "blogPosts", memoId);
    const legacySnap = await getDoc(legacyRef);
    if (!legacySnap.exists()) return null;
    return coerceMemoDoc(uid, legacySnap.id, legacySnap.data() as FirestoreMemoDoc);
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      return null;
    }
    return null;
  }
}

export async function upsertMemoToFirestore(input: {
  uid: string;
  memoId: string;
  title: string;
  summary: string;
  tag: MemoTag;
  contentMd: string;
}): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  const uid = input.uid.trim();
  const memoId = input.memoId.trim();
  if (!uid) throw new Error("uid 없이 Memo를 저장할 수 없습니다.");
  if (!memoId) throw new Error("memoId 없이 Memo를 저장할 수 없습니다.");

  const ref = doc(db, "users", uid, "memoPosts", memoId);
  await setDoc(
    ref,
    {
      uid,
      title: input.title,
      summary: input.summary,
      tag: input.tag,
      contentMd: input.contentMd,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteMemoFromFirestore(input: {
  uid: string;
  memoId: string;
}): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  const uid = input.uid.trim();
  const memoId = input.memoId.trim();
  if (!uid) throw new Error("uid 없이 Memo를 삭제할 수 없습니다.");
  if (!memoId) throw new Error("memoId 없이 Memo를 삭제할 수 없습니다.");

  const ref = doc(db, "users", uid, "memoPosts", memoId);
  await deleteDoc(ref);
}
