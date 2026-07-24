// 핵심 로직 단위 테스트 — Node 내장 러너 + 타입 스트리핑으로 실행.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  scheduleOnWrong,
  advanceReview,
  dueReviewIds,
  REVIEW_INTERVALS_DAYS,
} from "../src/lib/srs.ts";
import {
  estimateScore,
  latestAttempts,
  accuracyBySubject,
} from "../src/lib/scoring.ts";
import { buildTodaySet } from "../src/lib/session.ts";
import { daysUntil, ddayLabel } from "../src/lib/dday.ts";
import type { Attempt, Question, Review, Settings } from "../src/lib/types.ts";

const NOW = new Date("2026-07-23T09:00:00Z");

function daysBetween(aIso: string, base: Date): number {
  return Math.round(
    (new Date(aIso).getTime() - base.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ---------- SRS ----------
test("scheduleOnWrong: stage 0, 1일 뒤", () => {
  const r = scheduleOnWrong("q1", NOW);
  assert.equal(r.stage, 0);
  assert.equal(daysBetween(r.dueAt, NOW), 1);
});

test("advanceReview: 정답이면 stage 전진 (1→3일→7일)", () => {
  const r0 = scheduleOnWrong("q1", NOW);
  const r1 = advanceReview(r0, true, NOW);
  assert.ok(r1);
  assert.equal(r1!.stage, 1);
  assert.equal(daysBetween(r1!.dueAt, NOW), REVIEW_INTERVALS_DAYS[1]); // 3
  const r2 = advanceReview(r1!, true, NOW);
  assert.equal(r2!.stage, 2);
  assert.equal(daysBetween(r2!.dueAt, NOW), REVIEW_INTERVALS_DAYS[2]); // 7
});

test("advanceReview: 마지막 단계 통과 시 졸업(null)", () => {
  let r: Review | null = scheduleOnWrong("q1", NOW);
  r = advanceReview(r, true, NOW); // stage1
  r = advanceReview(r!, true, NOW); // stage2
  r = advanceReview(r!, true, NOW); // 졸업
  assert.equal(r, null);
});

test("advanceReview: 오답이면 stage 0으로 리셋", () => {
  const r1 = advanceReview(scheduleOnWrong("q1", NOW), true, NOW)!;
  assert.equal(r1.stage, 1);
  const reset = advanceReview(r1, false, NOW)!;
  assert.equal(reset.stage, 0);
  assert.equal(daysBetween(reset.dueAt, NOW), 1);
});

test("dueReviewIds: 마감 지난 문제만 반환", () => {
  const reviews: Review[] = [
    { questionId: "past", stage: 0, dueAt: "2026-07-20T00:00:00Z", updatedAt: "" },
    { questionId: "future", stage: 0, dueAt: "2026-08-01T00:00:00Z", updatedAt: "" },
  ];
  assert.deepEqual(dueReviewIds(reviews, NOW), ["past"]);
});

// ---------- 채점/점수 ----------
const QS: Question[] = [
  mkQ("d1", "data_modeling", "modeling_basics"),
  mkQ("d2", "data_modeling", "modeling_performance"),
  mkQ("s1", "sql", "sql_basics"),
  mkQ("s2", "sql", "sql_advanced"),
  mkQ("s3", "sql", "sql_management"),
];

function mkQ(id: string, subject: Question["subject"], category: Question["category"]): Question {
  return {
    id,
    subject,
    category,
    difficulty: 1,
    stem: id,
    choices: ["a", "b"],
    answerIndex: 0,
    explanation: "",
    tags: [],
  };
}
function mkA(qid: string, correct: boolean, at: string): Attempt {
  return {
    id: qid + at,
    questionId: qid,
    selectedIndex: 0,
    isCorrect: correct,
    confidence: "sure",
    answeredAt: at,
  };
}

test("latestAttempts: 같은 문제는 최신 결과만", () => {
  const a = [
    mkA("s1", false, "2026-07-20T00:00:00Z"),
    mkA("s1", true, "2026-07-22T00:00:00Z"),
  ];
  const latest = latestAttempts(a);
  assert.equal(latest.get("s1")!.isCorrect, true);
});

test("estimateScore: 배점 반영 (DM 20 / SQL 80)", () => {
  // DM 2문제 모두 정답 -> 20점, SQL 3문제 모두 정답 -> 80점
  const a = [
    mkA("d1", true, "2026-07-22T00:00:00Z"),
    mkA("d2", true, "2026-07-22T00:00:00Z"),
    mkA("s1", true, "2026-07-22T00:00:00Z"),
    mkA("s2", true, "2026-07-22T00:00:00Z"),
    mkA("s3", true, "2026-07-22T00:00:00Z"),
  ];
  const s = estimateScore(a, QS);
  assert.equal(s.dataModeling, 20);
  assert.equal(s.sql, 80);
  assert.equal(s.total, 100);
});

test("estimateScore: SQL 절반 정답이면 40점", () => {
  const a = [
    mkA("s1", true, "2026-07-22T00:00:00Z"),
    mkA("s2", false, "2026-07-22T00:00:00Z"),
  ];
  const s = estimateScore(a, QS);
  assert.equal(s.sql, 40); // 정답률 0.5 * 80
});

test("accuracyBySubject: 과목별 집계", () => {
  const a = [mkA("s1", true, "t1"), mkA("s2", false, "t2")];
  const acc = accuracyBySubject(a, QS);
  assert.equal(acc.sql.total, 2);
  assert.equal(acc.sql.correct, 1);
});

// ---------- 오늘의 세트 ----------
const SETTINGS: Settings = { examDate: "2026-08-22", dailyGoal: 4, sqlWeight: 0.7 };

test("buildTodaySet: 목표 수를 넘지 않는다", () => {
  const set = buildTodaySet({ questions: QS, attempts: [], reviews: [], settings: SETTINGS, now: NOW });
  assert.ok(set.questionIds.length <= SETTINGS.dailyGoal);
  assert.equal(new Set(set.questionIds).size, set.questionIds.length); // 중복 없음
});

test("buildTodaySet: 복습 대기 문제를 우선 포함", () => {
  const reviews: Review[] = [
    { questionId: "s3", stage: 0, dueAt: "2026-07-20T00:00:00Z", updatedAt: "" },
  ];
  const set = buildTodaySet({ questions: QS, attempts: [], reviews, settings: SETTINGS, now: NOW });
  assert.ok(set.questionIds.includes("s3"));
  assert.ok(set.reviewCount >= 1);
  assert.equal(set.questionIds[0], "s3"); // 복습이 맨 앞
});

test("buildTodaySet: SQL 가중 — 신규에서 SQL 우선", () => {
  const bigSettings: Settings = { examDate: "", dailyGoal: 3, sqlWeight: 0.7 };
  const set = buildTodaySet({ questions: QS, attempts: [], reviews: [], settings: bigSettings, now: NOW });
  const sqlCount = set.questionIds.filter((id) => id.startsWith("s")).length;
  assert.ok(sqlCount >= 2, `SQL ${sqlCount}개 (기대 >=2)`);
});

// ---------- D-day ----------
test("daysUntil / ddayLabel", () => {
  assert.equal(daysUntil("2026-07-30", NOW), 7);
  assert.equal(ddayLabel(7), "D-7");
  assert.equal(ddayLabel(0), "D-DAY");
  assert.equal(ddayLabel(-3), "D+3");
  assert.equal(ddayLabel(null), "시험일 미설정");
});
