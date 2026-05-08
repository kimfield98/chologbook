import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { initFirebase, storage as firebaseStorage } from "@/lib/firebase";

function ensureStorage() {
  initFirebase();
  return firebaseStorage;
}

function fileExtFromName(name: string): string | null {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return null;
  const ext = name.slice(idx + 1).toLowerCase().trim();
  if (!ext) return null;
  if (ext.length > 8) return null;
  return ext.replace(/[^a-z0-9]/g, "");
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function uploadBlogImage(input: {
  uid: string;
  postId: string;
  file: File;
}): Promise<{ downloadUrl: string; path: string }> {
  const s = ensureStorage();
  if (!s) {
    throw new Error("Storage가 초기화되지 않았습니다. .env.local을 확인하세요.");
  }
  const uid = input.uid.trim();
  const postId = input.postId.trim();
  if (!uid) throw new Error("uid 없이 이미지를 업로드할 수 없습니다.");
  if (!postId) throw new Error("postId 없이 이미지를 업로드할 수 없습니다.");

  const ext = fileExtFromName(input.file.name);
  const filename = ext ? `${randomId()}.${ext}` : randomId();
  const path = `blogImages/${uid}/${postId}/${filename}`;

  const r = ref(s, path);
  const meta =
    input.file.type && input.file.type.trim()
      ? { contentType: input.file.type.trim() }
      : undefined;
  const snap = await uploadBytes(r, input.file, meta);
  const downloadUrl = await getDownloadURL(snap.ref);
  return { downloadUrl, path };
}

