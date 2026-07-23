// 정답률 / 예상점수 계산
import type { Attempt, Question, Subject, Category } from "./types";
import { CATEGORY_SUBJECT } from "./types";

/** 문제별 "최신 풀이 결과"만 남긴다 (같은 문제 여러 번 풀면 마지막만 반영) */
export function latestAttempts(attempts: Attempt[]): Map<string, Attempt> {
  const byQ = new Map<string, Attempt>();
  for (const a of [...attempts].sort(
    (x, y) => new Date(x.answeredAt).getTime() - new Date(y.answeredAt).getTime()
  )) {
    byQ.set(a.questionId, a);
  }
  return byQ;
}

export interface Accuracy {
  total: number;
  correct: number;
  rate: number; // 0~1
}

function acc(items: Attempt[]): Accuracy {
  const total = items.length;
  const correct = items.filter((a) => a.isCorrect).length;
  return { total, correct, rate: total ? correct / total : 0 };
}

/** 과목별 정답률 (문제 최신 결과 기준) */
export function accuracyBySubject(
  attempts: Attempt[],
  questions: Question[]
): Record<Subject, Accuracy> {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const latest = [...latestAttempts(attempts).values()];
  const group = (s: Subject) =>
    latest.filter((a) => qMap.get(a.questionId)?.subject === s);
  return {
    data_modeling: acc(group("data_modeling")),
    sql: acc(group("sql")),
  };
}

/** 유형별 정답률 */
export function accuracyByCategoryWith(
  attempts: Attempt[],
  questions: Question[]
): Partial<Record<Category, Accuracy>> {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const latest = [...latestAttempts(attempts).values()];
  const out: Partial<Record<Category, Accuracy>> = {};
  const cats = new Set<Category>();
  latest.forEach((a) => {
    const c = qMap.get(a.questionId)?.category;
    if (c) cats.add(c);
  });
  for (const c of cats) {
    out[c] = acc(
      latest.filter((a) => qMap.get(a.questionId)?.category === c)
    );
  }
  return out;
}

export interface EstimatedScore {
  dataModeling: number; // 0~20
  sql: number; // 0~80
  total: number; // 0~100
  enoughSample: boolean;
  sample: number;
}

/**
 * 실제 SQLD 배점 반영: 데이터모델링 20점 / SQL 80점.
 * 각 과목 최신 정답률 * 배점.
 */
export function estimateScore(
  attempts: Attempt[],
  questions: Question[]
): EstimatedScore {
  const bySub = accuracyBySubject(attempts, questions);
  const dm = Math.round(bySub.data_modeling.rate * 20);
  const sql = Math.round(bySub.sql.rate * 80);
  const sample = bySub.data_modeling.total + bySub.sql.total;
  return {
    dataModeling: dm,
    sql,
    total: dm + sql,
    enoughSample: sample >= 10,
    sample,
  };
}

/** 확신도 대비 정답 통계 (찍었는데 맞음 / 확실한데 틀림 등) */
export function confidenceBreakdown(attempts: Attempt[]) {
  const buckets = {
    sure: { total: 0, correct: 0 },
    unsure: { total: 0, correct: 0 },
    guess: { total: 0, correct: 0 },
  };
  for (const a of attempts) {
    const b = buckets[a.confidence];
    b.total += 1;
    if (a.isCorrect) b.correct += 1;
  }
  return buckets;
}
