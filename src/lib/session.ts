// 오늘의 문제 세트 구성 로직
import type { Attempt, Question, Review, Settings } from "./types";
import { dueReviewIds } from "./srs";

interface BuildInput {
  questions: Question[];
  attempts: Attempt[];
  reviews: Review[];
  settings: Settings;
  now?: Date;
}

export interface TodaySet {
  questionIds: string[];
  reviewCount: number;
  newCount: number;
}

/** 동일 유형 3개 연속 방지 배치 */
function spread(ids: string[], byId: Map<string, Question>): string[] {
  const out: string[] = [];
  const pool = [...ids];
  let lastCat: string | null = null;
  let streak = 0;
  while (pool.length) {
    let idx = pool.findIndex((id) => {
      const c = byId.get(id)?.category ?? "";
      return !(streak >= 2 && c === lastCat);
    });
    if (idx === -1) idx = 0; // 대안 없으면 그냥 진행
    const [picked] = pool.splice(idx, 1);
    const cat = byId.get(picked)?.category ?? "";
    streak = cat === lastCat ? streak + 1 : 1;
    lastCat = cat;
    out.push(picked);
  }
  return out;
}

export function buildTodaySet(input: BuildInput): TodaySet {
  const { questions, attempts, reviews, settings } = input;
  const now = input.now ?? new Date();
  const goal = Math.max(1, settings.dailyGoal);
  const byId = new Map(questions.map((q) => [q.id, q]));

  // 1) 복습 대기 (마감 지난) 우선
  const due = dueReviewIds(reviews, now).filter((id) => byId.has(id));
  const chosen = new Set<string>(due.slice(0, goal));

  // 2) 신규(아직 안 푼) 문제로 채우기 — SQL 가중
  const attemptedIds = new Set(attempts.map((a) => a.questionId));
  const fresh = questions.filter(
    (q) => !attemptedIds.has(q.id) && !chosen.has(q.id)
  );
  const freshSql = fresh.filter((q) => q.subject === "sql");
  const freshDm = fresh.filter((q) => q.subject === "data_modeling");

  const remaining = () => goal - chosen.size;
  const targetSql = Math.round(remaining() * settings.sqlWeight);
  let addedSql = 0;
  for (const q of freshSql) {
    if (chosen.size >= goal || addedSql >= targetSql) break;
    chosen.add(q.id);
    addedSql += 1;
  }
  for (const q of freshDm) {
    if (chosen.size >= goal) break;
    chosen.add(q.id);
  }
  for (const q of freshSql) {
    if (chosen.size >= goal) break;
    chosen.add(q.id);
  }

  // 3) 그래도 부족하면 과거 문제 재출제 (오래 안 본 것 우선)
  if (chosen.size < goal) {
    const lastSeen = new Map<string, number>();
    for (const a of attempts) {
      lastSeen.set(
        a.questionId,
        Math.max(lastSeen.get(a.questionId) ?? 0, new Date(a.answeredAt).getTime())
      );
    }
    const stale = questions
      .filter((q) => !chosen.has(q.id))
      .sort((a, b) => (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0));
    for (const q of stale) {
      if (chosen.size >= goal) break;
      chosen.add(q.id);
    }
  }

  const reviewIds = due.filter((id) => chosen.has(id));
  const rest = [...chosen].filter((id) => !reviewIds.includes(id));
  const ordered = [...reviewIds, ...spread(rest, byId)];

  return {
    questionIds: ordered,
    reviewCount: reviewIds.length,
    newCount: ordered.length - reviewIds.length,
  };
}
