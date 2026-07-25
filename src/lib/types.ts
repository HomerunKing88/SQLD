// 도메인 타입 정의

export type Subject = "data_modeling" | "sql";

export type Category =
  | "modeling_basics"
  | "modeling_performance"
  | "sql_basics"
  | "sql_advanced"
  | "sql_management";

export type Confidence = "sure" | "unsure" | "guess";

/** SQL 단계별 실행 결과 (선택) */
export interface SqlStepTable {
  columns: string[];
  data: (string | number | null)[][];
}

export interface SqlStep {
  clause: string; // 예: "FROM / JOIN"
  desc: string;
  table: SqlStepTable;
}

export interface SqlSteps {
  query: string;
  steps: SqlStep[];
  /**
   * 앞에서부터 몇 개의 step이 '주어진 데이터(전제)'인지.
   * 이 수만큼의 step은 정답 확인 전에도 보여준다(문제를 풀 수 있도록).
   * 나머지 step(중간 과정·결과)은 정답을 노출하므로 제출 후에만 공개.
   */
  givenCount?: number;
}

export interface Question {
  id: string;
  subject: Subject;
  category: Category;
  difficulty: 1 | 2 | 3;
  stem: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  sqlSteps?: SqlSteps;
  tags: string[];
}

/** 빈출 개념 카드(플래시카드) — 이동 중 반복 암기용 */
export interface Concept {
  id: string;
  category: Category;
  title: string; // 개념명(앞면 큰 제목)
  front: string; // 앞면 자문 프롬프트(핵심 질문)
  summary: string; // 뒷면 핵심 요약
  trap?: string; // 함정 포인트
  example?: string; // 빠른 예제(정답 포함)
  tags: string[];
}

/** O/X 함정 퀴즈 1문항 */
export interface OxItem {
  id: string;
  category: Category;
  statement: string; // 판정할 진술
  answer: boolean; // true=O(옳다), false=X(그르다)
  explain: string; // 해설
  tags: string[];
}

/** 카드 자가채점 등급 */
export type CardRating = "again" | "ok" | "known";

/** 개념 카드 학습 진행(개념당 1행) — 점수 통계와 분리 */
export interface CardProgress {
  conceptId: string;
  rating: CardRating;
  seenCount: number;
  updatedAt: string; // ISO
}

export interface Attempt {
  id: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  confidence: Confidence;
  answeredAt: string; // ISO
  source?: "study" | "mock"; // 미지정=study
}

/** 모의고사 1회 결과 */
export interface MockResult {
  id: string;
  takenAt: string; // ISO
  total: number; // 총 문항 수
  correct: number; // 맞힌 문항 수
  dataModeling: number; // 0~20
  sql: number; // 0~80
  score: number; // 0~100 (실배점 합)
  durationSec: number; // 소요 시간(초)
  passed: boolean; // 60점 이상
}

/** 간격 반복 복습 스케줄 (문제당 1행) */
export interface Review {
  questionId: string;
  stage: number; // 0->1일, 1->3일, 2->7일, 3->졸업
  dueAt: string; // ISO
  updatedAt: string;
}

export interface Settings {
  examDate: string; // YYYY-MM-DD
  dailyGoal: number;
  sqlWeight: number; // 0~1
}

export const CATEGORY_LABEL: Record<Category, string> = {
  modeling_basics: "데이터모델링의 이해",
  modeling_performance: "데이터 모델과 성능",
  sql_basics: "SQL 기본",
  sql_advanced: "SQL 활용",
  sql_management: "관리 구문",
};

export const SUBJECT_LABEL: Record<Subject, string> = {
  data_modeling: "데이터 모델링",
  sql: "SQL 기본 및 활용",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  sure: "확실함",
  unsure: "애매함",
  guess: "찍음",
};

export const CATEGORY_SUBJECT: Record<Category, Subject> = {
  modeling_basics: "data_modeling",
  modeling_performance: "data_modeling",
  sql_basics: "sql",
  sql_advanced: "sql",
  sql_management: "sql",
};
