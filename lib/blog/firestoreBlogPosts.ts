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
import type { BlogCategory } from "@/lib/blog/types";

export type FirestoreBlogPost = {
  id: string;
  uid: string;
  title: string;
  summary: string;
  category: BlogCategory;
  contentMd: string;
  coverImageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type FirestoreBlogPostDoc = {
  uid?: string;
  title?: string;
  summary?: string;
  category?: BlogCategory;
  contentMd?: string;
  coverImageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function ensureDb() {
  return firestoreDb ?? initFirebase();
}

function blogPostsCollectionRef(
  db: NonNullable<ReturnType<typeof ensureDb>>,
  uid: string,
) {
  return collection(db, "users", uid, "blogPosts");
}

function coerceBlogPostDoc(
  uid: string,
  id: string,
  data: FirestoreBlogPostDoc,
): FirestoreBlogPost {
  const title = String(data.title ?? "").trim() || "제목 없음";
  const summary = String(data.summary ?? "").trim();
  const category: BlogCategory =
    data.category === "economy" ||
    data.category === "work" ||
    data.category === "development" ||
    data.category === "life"
      ? data.category
      : "life";
  const contentMd = String(data.contentMd ?? "");
  const coverImageUrl =
    typeof data.coverImageUrl === "string" && data.coverImageUrl.trim()
      ? data.coverImageUrl.trim()
      : undefined;

  return {
    id,
    uid,
    title,
    summary,
    category,
    contentMd,
    coverImageUrl,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listBlogPostsFromFirestore(
  uid: string,
): Promise<FirestoreBlogPost[]> {
  const db = ensureDb();
  if (!db || !uid.trim()) return [];

  try {
    const q = query(
      blogPostsCollectionRef(db, uid),
      orderBy("updatedAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      coerceBlogPostDoc(uid, d.id, d.data() as FirestoreBlogPostDoc),
    );
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      return [];
    }
    return [];
  }
}

export async function getBlogPostFromFirestore(
  uid: string,
  postId: string,
): Promise<FirestoreBlogPost | null> {
  const db = ensureDb();
  if (!db || !uid.trim() || !postId.trim()) return null;

  try {
    const ref = doc(db, "users", uid, "blogPosts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return coerceBlogPostDoc(uid, snap.id, snap.data() as FirestoreBlogPostDoc);
  } catch (e) {
    if (e instanceof FirebaseError && e.code === "permission-denied") {
      return null;
    }
    return null;
  }
}

export async function upsertBlogPostToFirestore(input: {
  uid: string;
  postId: string;
  title: string;
  summary: string;
  category: BlogCategory;
  contentMd: string;
  coverImageUrl?: string;
}): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  const uid = input.uid.trim();
  const postId = input.postId.trim();
  if (!uid) throw new Error("uid 없이 BlogPost를 저장할 수 없습니다.");
  if (!postId) throw new Error("postId 없이 BlogPost를 저장할 수 없습니다.");

  const ref = doc(db, "users", uid, "blogPosts", postId);
  await setDoc(
    ref,
    {
      uid,
      title: input.title,
      summary: input.summary,
      category: input.category,
      contentMd: input.contentMd,
      coverImageUrl: input.coverImageUrl ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteBlogPostFromFirestore(input: {
  uid: string;
  postId: string;
}): Promise<void> {
  const db = ensureDb();
  if (!db) {
    throw new Error("Firestore가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  const uid = input.uid.trim();
  const postId = input.postId.trim();
  if (!uid) throw new Error("uid 없이 BlogPost를 삭제할 수 없습니다.");
  if (!postId) throw new Error("postId 없이 BlogPost를 삭제할 수 없습니다.");

  const ref = doc(db, "users", uid, "blogPosts", postId);
  await deleteDoc(ref);
}

