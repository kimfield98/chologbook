/** Topic = 그룹/카테고리 (로그는 전역 `logs`에서 topicId로 연결) */
export type Topic = {
  id: string;
  title: string;
};

/** 전역 리스트의 한 건 (Firestore는 항상 익명 Auth uid 기준으로 분리) */
export type Log = {
  id: string;
  userId: string;
  topicId: string;
  date: string;
  text: string;
};
