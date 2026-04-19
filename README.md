# CHOLOGBOOK | 초록북 🌱

기록은 하고 싶은데,  
매번 길게 쓰기는 부담스럽고  
꾸준히 이어가는 건 더 어렵다면?

“오늘도 했다”는 사실만이라도  
가볍게 쌓아갈 수 있는 방식은 없을까?

초록북은  
작은 실행을 기록하고,  
그 흐름이 이어지는 것을 눈으로 확인하며  
스스로를 이해할 수 있도록 돕는 기록 앱입니다.

---

**더 자세한 이야기가 궁금하다면👉🏻** [링크]([https://wise-tumbleweed-aa3.notion.site/CHOLOGBOOK-33d672f9fc07802d9040cadcf37c9d44?pvs=74](https://wise-tumbleweed-aa3.notion.site/CHOLOGBOOK-33d672f9fc07802d9040cadcf37c9d44?pvs=74))


---

## 정보
기간 : 2026년 ~ 진행 중
> 김초원 (기획 · FE · 구조 설계)

## 주요 기능

- Topic 단위 루틴 관리  
→ 반복하고 싶은 습관을 하나의 흐름으로 정의
- 하루 1회 기록  
→ “오늘도 했어요” 버튼으로 간단하게 실행 기록
- 연속 기록(Streak) 표시  
→ 얼마나 흐름을 이어왔는지 한눈에 확인
- 로그 기록  
→ 날짜와 함께 간단한 메모 저장
- 테스트 모드  
→ 기능을 빠르게 검증할 수 있는 내부 도구
- Firebase Firestore 연동  
→ 기록이 사라지지 않고 계속 쌓이도록 저장

---

## 핵심 구조

### Topic / Log 구조

- Topic: 내가 쌓고 싶은 흐름 (예: 영어 회화)  
- Log: 실제 기록 (날짜 + 내용)

```ts
type Topic = {
  id: string;
  title: string;
}

type Log = {
  id: string;
  topicId: string;
  date: string;
  text: string;
}
```

---

### 데이터 흐름

- 모든 기록은 하나의 logs 배열에서 관리  
- Topic별 기록은 필요할 때 필터링해서 사용

```ts
getLogsByTopic(logs, topicId)
```

---

## 기술 스택

- Next.js (App Router), React  
- Tailwind CSS  
- Firebase Firestore  
- TypeScript

---

## 설계 방향

- 최대한 간단하게 기록할 수 있도록 설계  
- 사용자가 “계속 쓰게 만드는 흐름”에 집중  
- 데이터는 쌓이고, 흐름은 눈에 보이도록 구성

---

## 이 프로젝트를 만든 이유

단순히 기록을 남기기 위한 앱이 아니라

→ **“나는 어떤 것을 꾸준히 해내는 사람인가”를 확인하기 위해**

---

## 앞으로 확장 방향

- 기록 데이터를 기반으로 한 인사이트 제공  
- 더 자연스럽게 이어지도록 UX 개선  
- 개인의 패턴을 분석하고 피드백 제공

