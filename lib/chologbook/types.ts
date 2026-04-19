/** Patch 한 건 (날짜 + 사용자 표현 텍스트) */
export type Log = {
  date: string;
  text: string;
};

/** 하나의 Topic (바구니) */
export type Topic = {
  id: string;
  title: string;
  logs: Log[];
};
