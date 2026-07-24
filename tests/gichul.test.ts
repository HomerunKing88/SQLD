// 기출 유형(태그) 세트 빌더
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTagSet } from "../src/lib/session.ts";
import { QUESTIONS } from "../src/data/questions.ts";
import type { Question, Settings } from "../src/lib/types.ts";

const settings: Settings = { examDate: "", dailyGoal: 10, sqlWeight: 0.7 };

test("buildTagSet: 기출유형 태그만 반환하고 목표 수 이내", () => {
  const res = buildTagSet(
    { questions: QUESTIONS, attempts: [], settings },
    "기출유형"
  );
  assert.ok(res.count >= 30, `기출유형 문항 ${res.count}개 (기대 >=30)`);
  assert.ok(res.questionIds.length <= settings.dailyGoal);
  const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
  for (const id of res.questionIds) {
    assert.ok(
      (byId.get(id) as Question).tags.includes("기출유형"),
      `${id}는 기출유형 태그여야 함`
    );
  }
});

test("buildTagSet: 없는 태그면 빈 세트", () => {
  const res = buildTagSet(
    { questions: QUESTIONS, attempts: [], settings },
    "존재하지않는태그"
  );
  assert.equal(res.count, 0);
  assert.equal(res.questionIds.length, 0);
});
