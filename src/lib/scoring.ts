// 정답률 / 예상점수 계산
import type { Attempt, Question, Subject, Category } from "./types";
import { CATEGORY_SUBJECT } from "./types";

/**
 * 학습(study) 풀이만. 모의고사(mock) 풀이는 예상점수·정답률에서 제외한다.
 * (모의고사 성적은 MockResult로 별도 관리 — 한 번의 시험이 학습 지표를 덮어쓰지 않도록)
 */
export function studyAttempts(attempts: Attempt[]): Attempt[] {
  return attempts.filter((a) => a.source !== "mock");
}

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
  const latest = [...latestAttempts(studyAttempts(attempts)).values()];
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
  const latest = [...latestAttempts(studyAttempts(attempts)).values()];
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

/** 태그(세부 개념)별 정답률. 한 문제의 각 태그에 최신 결과를 반영. */
export function accuracyByTag(
  attempts: Attempt[],
  questions: Question[]
): Map<string, Accuracy> {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const latest = [...latestAttempts(studyAttempts(attempts)).values()];
  const agg = new Map<string, { c: number; t: number }>();
  for (const a of latest) {
    const q = qMap.get(a.questionId);
    if (!q) continue;
    for (const tag of q.tags) {
      const cur = agg.get(tag) ?? { c: 0, t: 0 };
      cur.t += 1;
      if (a.isCorrect) cur.c += 1;
      agg.set(tag, cur);
    }
  }
  const out = new Map<string, Accuracy>();
  for (const [tag, { c, t }] of agg) {
    out.set(tag, { total: t, correct: c, rate: t ? c / t : 0 });
  }
  return out;
}

export interface TagStat extends Accuracy {
  tag: string;
}

/** 취약 태그(정답률 낮은 순). minTotal 이상 표본만, 최대 limit개. */
export function weakTags(
  attempts: Attempt[],
  questions: Question[],
  opts: { minTotal?: number; limit?: number } = {}
): TagStat[] {
  const minTotal = opts.minTotal ?? 1;
  const limit = opts.limit ?? 8;
  const list: TagStat[] = [];
  for (const [tag, acc] of accuracyByTag(attempts, questions)) {
    if (acc.total >= minTotal) list.push({ tag, ...acc });
  }
  list.sort((a, b) => a.rate - b.rate || b.total - a.total);
  return list.slice(0, limit);
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

export interface PassProjection {
  pass: boolean;
  gap: number; // 합격(60)까지 남은 점수
  questionsNeeded: number; // 문항당 2점 → 추가로 맞혀야 할 대략의 문항 수
}

/** 합격(60점) 기준 목표 프레이밍: 남은 점수와 대략 필요한 추가 정답 수. */
export function passProjection(score: EstimatedScore): PassProjection {
  const gap = Math.max(0, 60 - score.total);
  return {
    pass: score.total >= 60,
    gap,
    questionsNeeded: Math.ceil(gap / 2), // SQLD 문항당 2점
  };
}

/** 확신도 대비 정답 통계 (찍었는데 맞음 / 확실한데 틀림 등). 모의고사(mock) 제외. */
export function confidenceBreakdown(attempts: Attempt[]) {
  const buckets = {
    sure: { total: 0, correct: 0 },
    unsure: { total: 0, correct: 0 },
    guess: { total: 0, correct: 0 },
  };
  for (const a of attempts) {
    if (a.source === "mock") continue; // 확신도 입력이 없는 모의고사는 제외
    const b = buckets[a.confidence];
    b.total += 1;
    if (a.isCorrect) b.correct += 1;
  }
  return buckets;
}
