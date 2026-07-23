// 강화 기능 단위 테스트
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  nextReviewOnAnswer,
  scheduleOnWrong,
  REVIEW_INTERVALS_DAYS,
} from "../src/lib/srs.ts";
import {
  todayUniqueCount,
  todayCount,
  currentStreak,
  dailyProgress,
} from "../src/lib/streak.ts";
import { buildTodaySet } from "../src/lib/session.ts";
import type { Attempt, Confidence, Question, Review, Settings } from "../src/lib/types.ts";

const NOW = new Date("2026-07-23T09:00:00Z");
function daysFrom(iso: string, base: Date): number {
  return Math.round((new Date(iso).getTime() - base.getTime()) / 86400000);
}

// ---------- 확신도 반영 SRS ----------
test("nextReviewOnAnswer: 오답이면 stage0(1일) 리셋", () => {
  const r = nextReviewOnAnswer("q1", undefined, false, "sure", NOW);
  assert.ok(r);
  assert.equal(r!.stage, 0);
  assert.equal(daysFrom(r!.dueAt, NOW), 1);
});

test("nextReviewOnAnswer: 정답+확실함+기존없음 → 복습 없음(null)", () => {
  const r = nextReviewOnAnswer("q1", undefined, true, "sure", NOW);
  assert.equal(r, null);
});

test("nextReviewOnAnswer: 정답+확실함+기존있음 → 단계 전진", () => {
  const existing: Review = scheduleOnWrong("q1", NOW); // stage0
  const r = nextReviewOnAnswer("q1", existing, true, "sure", NOW);
  assert.ok(r);
  assert.equal(r!.stage, 1);
  assert.equal(daysFrom(r!.dueAt, NOW), REVIEW_INTERVALS_DAYS[1]); // 3
});

test("nextReviewOnAnswer: 정답+'찍음'+기존없음 → 복습 등록(stage0,1일)", () => {
  const r = nextReviewOnAnswer("q1", undefined, true, "guess", NOW);
  assert.ok(r, "찍어서 맞힌 문제는 복습에 등록되어야 한다");
  assert.equal(r!.stage, 0);
  assert.equal(daysFrom(r!.dueAt, NOW), 1);
});

test("nextReviewOnAnswer: 정답+'애매함'+기존있음 → 전진 없이 현재 단계 유지", () => {
  const existing: Review = {
    questionId: "q1",
    stage: 1,
    dueAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
  };
  const r = nextReviewOnAnswer("q1", existing, true, "unsure", NOW);
  assert.ok(r);
  assert.equal(r!.stage, 1, "애매하게 맞으면 단계 전진하지 않는다");
  assert.equal(daysFrom(r!.dueAt, NOW), REVIEW_INTERVALS_DAYS[1]); // 3일 뒤 다시
});

// ---------- 스트릭/일일 진행 ----------
function attemptAt(qid: string, d: Date): Attempt {
  return {
    id: qid + d.toISOString(),
    questionId: qid,
    selectedIndex: 0,
    isCorrect: true,
    confidence: "sure",
    answeredAt: d.toISOString(),
  };
}
// 로컬 자정 기준으로 날짜를 만들어 타임존 경계 문제 회피
function localDay(offsetDays: number, base: Date): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + offsetDays);
  d.setHours(10, 0, 0, 0);
  return d;
}

test("todayCount / todayUniqueCount", () => {
  const at = [
    attemptAt("a", localDay(0, NOW)),
    attemptAt("a", localDay(0, NOW)), // 같은 문제 재풀이
    attemptAt("b", localDay(0, NOW)),
    attemptAt("c", localDay(-1, NOW)), // 어제
  ];
  assert.equal(todayCount(at, NOW), 3);
  assert.equal(todayUniqueCount(at, NOW), 2); // a, b
});

test("currentStreak: 오늘 포함 연속", () => {
  const at = [
    attemptAt("a", localDay(0, NOW)),
    attemptAt("b", localDay(-1, NOW)),
    attemptAt("c", localDay(-2, NOW)),
  ];
  assert.equal(currentStreak(at, NOW), 3);
});

test("currentStreak: 오늘 안했어도 어제까지면 유지", () => {
  const at = [
    attemptAt("b", localDay(-1, NOW)),
    attemptAt("c", localDay(-2, NOW)),
  ];
  assert.equal(currentStreak(at, NOW), 2);
});

test("currentStreak: 이틀 이상 공백이면 0", () => {
  const at = [attemptAt("c", localDay(-2, NOW))];
  assert.equal(currentStreak(at, NOW), 0);
});

test("dailyProgress: 목표 달성 판정", () => {
  const at = [
    attemptAt("a", localDay(0, NOW)),
    attemptAt("b", localDay(0, NOW)),
    attemptAt("c", localDay(0, NOW)),
  ];
  const dp = dailyProgress(at, 3, NOW);
  assert.equal(dp.done, 3);
  assert.equal(dp.reached, true);
  assert.equal(dp.ratio, 1);
});

// ---------- 취약 유형 우선 출제 ----------
function mkQ(id: string, category: Question["category"]): Question {
  const subject = category.startsWith("modeling") ? "data_modeling" : "sql";
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

test("buildTodaySet: 취약(정답률 낮은) SQL 유형을 먼저 낸다", () => {
  // sql_advanced 는 과거에 틀림(취약), sql_basics 는 정답(강함)
  const questions: Question[] = [
    mkQ("adv_new", "sql_advanced"),
    mkQ("bas_new", "sql_basics"),
    mkQ("adv_old", "sql_advanced"),
    mkQ("bas_old", "sql_basics"),
  ];
  const attempts: Attempt[] = [
    {
      id: "1",
      questionId: "adv_old",
      selectedIndex: 1,
      isCorrect: false,
      confidence: "guess",
      answeredAt: "2026-07-20T00:00:00Z",
    },
    {
      id: "2",
      questionId: "bas_old",
      selectedIndex: 0,
      isCorrect: true,
      confidence: "sure",
      answeredAt: "2026-07-20T00:00:00Z",
    },
  ];
  const settings: Settings = { examDate: "", dailyGoal: 1, sqlWeight: 1 };
  const set = buildTodaySet({ questions, attempts, reviews: [], settings, now: NOW });
  assert.equal(
    set.questionIds[0],
    "adv_new",
    "취약 유형(sql_advanced) 신규 문제가 먼저 나와야 한다"
  );
});
