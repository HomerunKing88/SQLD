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

export interface Attempt {
  id: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  confidence: Confidence;
  answeredAt: string; // ISO
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
