// 오늘의 문제 세트 구성 로직
import type { Attempt, Category, Question, Review, Settings } from "./types";
import { dueReviewIds } from "./srs";
import { latestAttempts } from "./scoring";

/**
 * 유형별 취약도 순위표. 값이 낮을수록 취약(우선).
 * - 정답률이 낮은 유형일수록 우선.
 * - 아직 안 푼 유형은 0.5(중립)로 두어, 취약 유형 다음·강한 유형 앞에 배치.
 */
function categoryWeakness(
  attempts: Attempt[],
  byId: Map<string, Question>
): Map<Category, number> {
  const latest = [...latestAttempts(attempts).values()];
  const agg = new Map<Category, { c: number; t: number }>();
  for (const a of latest) {
    const cat = byId.get(a.questionId)?.category;
    if (!cat) continue;
    const cur = agg.get(cat) ?? { c: 0, t: 0 };
    cur.t += 1;
    if (a.isCorrect) cur.c += 1;
    agg.set(cat, cur);
  }
  const rank = new Map<Category, number>();
  for (const [cat, { c, t }] of agg) rank.set(cat, t ? c / t : 0.5);
  return rank;
}

/** 취약 유형(정답률 낮은 순) 먼저 오도록 정렬 */
function byWeakness(
  list: Question[],
  weakness: Map<Category, number>
): Question[] {
  return [...list].sort(
    (a, b) =>
      (weakness.get(a.category) ?? 0.5) - (weakness.get(b.category) ?? 0.5)
  );
}

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
  newCount: number; // 아직 안 푼 '진짜 신규' 문항 수
  reservedCount: number; // 은행 소진으로 재출제된(복습성) 문항 수
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

  // 2) 신규(아직 안 푼) 문제로 채우기 — SQL 가중 + 취약 유형 우선
  //    '푼 문제' 판정은 학습(study) 기준. 모의고사로 스친 문항까지 신규에서 빼면
  //    신규 문제가 급격히 고갈되므로 mock은 제외한다.
  const weakness = categoryWeakness(attempts, byId);
  const attemptedIds = new Set(
    attempts.filter((a) => a.source !== "mock").map((a) => a.questionId)
  );
  const fresh = byWeakness(
    questions.filter((q) => !attemptedIds.has(q.id) && !chosen.has(q.id)),
    weakness
  );
  const freshIdSet = new Set(fresh.map((q) => q.id));
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
      .sort((a, b) => {
        // 취약 유형 우선, 동률이면 오래 안 본 것 우선
        const wa = weakness.get(a.category) ?? 0.5;
        const wb = weakness.get(b.category) ?? 0.5;
        if (wa !== wb) return wa - wb;
        return (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0);
      });
    for (const q of stale) {
      if (chosen.size >= goal) break;
      chosen.add(q.id);
    }
  }

  const reviewIds = due.filter((id) => chosen.has(id));
  const rest = [...chosen].filter((id) => !reviewIds.includes(id));
  const ordered = [...reviewIds, ...spread(rest, byId)];

  // 신규(아직 안 푼) vs 재출제(은행 소진) 구분 — 재출제를 '신규'로 오표기하지 않는다.
  const newCount = rest.filter((id) => freshIdSet.has(id)).length;
  return {
    questionIds: ordered,
    reviewCount: reviewIds.length,
    newCount,
    reservedCount: rest.length - newCount,
  };
}

/**
 * 취약 유형 집중 특훈 세트.
 * - 정답률이 낮은 유형(취약)을 우선, 최근 오답 문항을 앞쪽에 배치.
 * - 데이터가 없으면 SQL 과목을 약간 우선(핵심 목표 반영).
 * - '오늘의 세트'와 달리 유형을 흩뿌리지 않고 취약 순서대로 몰아서 낸다.
 */
export function buildWeakDrillSet(input: {
  questions: Question[];
  attempts: Attempt[];
  settings: Settings;
}): { questionIds: string[]; focusCategory: Category | null } {
  const { questions, attempts, settings } = input;
  const goal = Math.max(1, settings.dailyGoal);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const weakness = categoryWeakness(attempts, byId);
  const latest = latestAttempts(attempts);

  // 우선순위 점수(낮을수록 먼저): 유형 취약도 + 오답 가중 + SQL 소폭 우선
  const prio = (q: Question): number => {
    const w = weakness.get(q.category) ?? 0.5;
    const a = latest.get(q.id);
    const wrongAdj = a ? (a.isCorrect ? 0.3 : -0.3) : 0; // 오답 앞으로, 정답 뒤로
    const sqlAdj = q.subject === "sql" ? -0.05 : 0;
    return w + wrongAdj + sqlAdj;
  };

  const ordered = [...questions].sort((a, b) => {
    const d = prio(a) - prio(b);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
  const questionIds = ordered.slice(0, goal).map((q) => q.id);
  const focusCategory = questionIds.length
    ? byId.get(questionIds[0])!.category
    : null;
  return { questionIds, focusCategory };
}

/**
 * 특정 태그(예: '기출유형') 문항만 모아 세트 구성. 취약·미완료 우선.
 * count = 해당 태그 전체 문항 수(홈 표시용).
 */
export function buildTagSet(
  input: { questions: Question[]; attempts: Attempt[]; settings: Settings },
  tag: string
): { questionIds: string[]; count: number } {
  const { questions, attempts, settings } = input;
  const goal = Math.max(1, settings.dailyGoal);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const weakness = categoryWeakness(attempts, byId);
  const latest = latestAttempts(attempts.filter((a) => a.source !== "mock"));

  const pool = questions.filter((q) => q.tags.includes(tag));
  const prio = (q: Question): number => {
    const w = weakness.get(q.category) ?? 0.5;
    const a = latest.get(q.id);
    const seenAdj = a ? (a.isCorrect ? 0.3 : -0.3) : -0.1; // 미풀이 살짝 우선, 오답 더 우선
    return w + seenAdj;
  };
  const ordered = [...pool].sort((a, b) => {
    const d = prio(a) - prio(b);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
  return {
    questionIds: ordered.slice(0, goal).map((q) => q.id),
    count: pool.length,
  };
}
