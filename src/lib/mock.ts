// 모의고사 구성 & 채점 (실제 SQLD 배점 반영)
import type { MockResult, Question } from "./types";

export interface MockConfig {
  modeling: number; // 데이터 모델링 문항 수 (실제 10)
  sql: number; // SQL 문항 수 (실제 40)
}

// 실제 SQLD: 과목1 10문항(20점) + 과목2 40문항(80점), 문항당 2점
export const DEFAULT_MOCK: MockConfig = { modeling: 10, sql: 40 };

/** 제한 시간(초): 문항당 100초 ≈ 실제 90분/50문항 페이스 */
export function mockTimeLimitSec(count: number): number {
  return count * 100;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 모의고사 문항 세트(모델링 먼저, 그다음 SQL). 부족하면 있는 만큼. */
export function buildMockExam(
  questions: Question[],
  config: MockConfig = DEFAULT_MOCK,
  rng: () => number = Math.random
): string[] {
  const dm = shuffle(
    questions.filter((q) => q.subject === "data_modeling"),
    rng
  ).slice(0, config.modeling);
  const sql = shuffle(
    questions.filter((q) => q.subject === "sql"),
    rng
  ).slice(0, config.sql);
  return [...dm, ...sql].map((q) => q.id);
}

/**
 * 실배점 채점: 데이터모델링 20점 / SQL 80점.
 * 합격 = 총점 60 이상 AND 과목별 40% 이상(과락 없음).
 */
export function scoreMock(input: {
  questions: Question[];
  ids: string[];
  correctById: Record<string, boolean>;
  durationSec: number;
}): Omit<MockResult, "id" | "takenAt"> {
  const qMap = new Map(input.questions.map((q) => [q.id, q]));
  let dmTotal = 0,
    dmCorrect = 0,
    sqlTotal = 0,
    sqlCorrect = 0;
  for (const id of input.ids) {
    const q = qMap.get(id);
    if (!q) continue;
    const ok = input.correctById[id] === true;
    if (q.subject === "data_modeling") {
      dmTotal += 1;
      if (ok) dmCorrect += 1;
    } else {
      sqlTotal += 1;
      if (ok) sqlCorrect += 1;
    }
  }
  const dmRate = dmTotal ? dmCorrect / dmTotal : 0;
  const sqlRate = sqlTotal ? sqlCorrect / sqlTotal : 0;
  const dataModeling = Math.round(dmRate * 20);
  const sql = Math.round(sqlRate * 80);
  const score = dataModeling + sql;
  const noFail =
    (dmTotal === 0 || dmRate >= 0.4) && (sqlTotal === 0 || sqlRate >= 0.4);
  return {
    total: dmTotal + sqlTotal,
    correct: dmCorrect + sqlCorrect,
    dataModeling,
    sql,
    score,
    durationSec: input.durationSec,
    passed: score >= 60 && noFail,
  };
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}분 ${String(s).padStart(2, "0")}초`;
}

export function formatClock(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
