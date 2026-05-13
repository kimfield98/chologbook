import { PUBLIC_OWNER_UID } from "@/lib/chologbook/publicOwner";

export const firestoreRulesSnippet = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isPublicOwner(uid) {
      return uid == "${PUBLIC_OWNER_UID}";
    }

    match /logs/{logId} {
      allow read: if isPublicOwner(resource.data.userId)
        || (request.auth != null && resource.data.userId == request.auth.uid);

      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    match /users/{userId}/topics/{topicId} {
      allow read: if isPublicOwner(userId)
        || (request.auth != null && request.auth.uid == userId);

      allow write: if request.auth != null
        && request.auth.uid == userId;
    }

    match /users/{userId}/memoPosts/{memoId} {
      allow read: if isPublicOwner(userId)
        || (request.auth != null && request.auth.uid == userId);

      allow create, update, delete: if request.auth != null
        && request.auth.uid == userId;
    }

    match /users/{userId}/blogPosts/{postId} {
      allow read: if isPublicOwner(userId)
        || (request.auth != null && request.auth.uid == userId);

      allow create, update, delete: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
`;
