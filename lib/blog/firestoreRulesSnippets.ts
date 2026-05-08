import { PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";

export const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid}/topics/{topicId} {
      allow read: if true; // 기존 public topic 허용이 이미 있다면 유지
      allow write: if isOwner(uid);
    }

    match /users/{uid}/blogPosts/{postId} {
      // 운영자 글은 공개 전시 (/blog)용으로 누구나 read
      allow read: if uid == '${PUBLIC_OWNER_UID}' || isOwner(uid);
      allow write, delete: if isOwner(uid);
    }

    // logs 컬렉션 등 기존 규칙은 그대로 유지/병합하세요.
  }
}
`;

export const storageRulesSnippet = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /blogImages/{uid}/{postId}/{fileName} {
      // 운영자 이미지는 공개 읽기 허용(전시용), 그 외는 본인만
      allow read: if uid == '${PUBLIC_OWNER_UID}' || isOwner(uid);
      allow write, delete: if isOwner(uid);
    }
  }
}
`;

