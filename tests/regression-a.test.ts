// Part A 회귀 방지: 모의고사(mock)가 학습 지표를 오염시키지 않는지 검증
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateScore, accuracyBySubject } from "../src/lib/scoring.ts";
import { dailyProgress } from "../src/lib/streak.ts";
import { buildTodaySet } from "../src/lib/session.ts";
import type { Attempt, Question, Settings } from "../src/lib/types.ts";

function q(id: string, subject: Question["subject"]): Question {
  return {
    id,
    subject,
    category: subject === "sql" ? "sql_basics" : "modeling_basics",
    difficulty: 1,
    stem: id,
    choices: ["a", "b"],
    answerIndex: 0,
    explanation: "",
    tags: [],
  };
}
function at(
  qid: string,
  correct: boolean,
  when: string,
  source?: "study" | "mock"
): Attempt {
  return {
    id: qid + when + (source ?? ""),
    questionId: qid,
    selectedIndex: 0,
    isCorrect: correct,
    confidence: "sure",
    answeredAt: when,
    source,
  };
}

const QS: Question[] = [q("s1", "sql"), q("s2", "sql"), q("m1", "data_modeling")];

test("A1: 모의고사 오답이 예상점수/정답률을 덮어쓰지 않는다", () => {
  // s1: 학습에서 정답(이른 시각) → 이후 모의고사에서 오답(늦은 시각)
  const attempts = [
    at("s1", true, "2026-07-22T00:00:00Z", "study"),
    at("s1", false, "2026-07-23T00:00:00Z", "mock"),
  ];
  const acc = accuracyBySubject(attempts, QS);
  assert.equal(acc.sql.total, 1, "학습 기준 1문항");
  assert.equal(acc.sql.correct, 1, "학습 정답 유지(모의고사 오답에 덮이지 않음)");
  const score = estimateScore(attempts, QS);
  assert.equal(score.sql, 80, "SQL 정답률 100% → 80점 (모의고사 제외)");
});

test("A6: 모의고사는 오늘 목표 진행에서 제외, 스트릭은 활동으로 인정", () => {
  const today = "2026-07-23T09:00:00Z";
  const now = new Date(today);
  const attempts = [
    at("s1", true, today, "study"),
    at("s2", false, today, "study"),
    at("m1", true, today, "mock"),
    at("s1", true, today, "mock"),
  ];
  const dp = dailyProgress(attempts, 5, now);
  assert.equal(dp.done, 2, "오늘 목표 진행은 학습 2문항만");
  assert.equal(dp.reached, false);
  assert.ok(dp.streak >= 1, "모의고사만 있어도 학습일로 인정되어 스트릭 유지");
});

test("A2: 모의고사로 스친 문항은 '신규'에서 제외되지 않는다", () => {
  // s1은 모의고사로만 풀림, s2는 학습으로 풀림
  const attempts = [
    at("s1", true, "2026-07-22T00:00:00Z", "mock"),
    at("s2", true, "2026-07-22T00:00:00Z", "study"),
  ];
  const settings: Settings = { examDate: "", dailyGoal: 1, sqlWeight: 1 };
  const set = buildTodaySet({
    questions: [q("s1", "sql"), q("s2", "sql")],
    attempts,
    reviews: [],
    settings,
    now: new Date("2026-07-23T00:00:00Z"),
  });
  // 학습으로 푼 s2는 '푼 문제'라 신규 후보에서 제외 → 신규는 s1이 선택되어야 함
  assert.deepEqual(set.questionIds, ["s1"], "학습 풀이만 신규에서 제외");
});
