// 모의고사 구성·채점 테스트
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMockExam, scoreMock } from "../src/lib/mock.ts";
import type { Question } from "../src/lib/types.ts";

function mk(id: string, subject: Question["subject"]): Question {
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

const bank: Question[] = [
  ...Array.from({ length: 15 }, (_, i) => mk(`m${i}`, "data_modeling")),
  ...Array.from({ length: 50 }, (_, i) => mk(`s${i}`, "sql")),
];

// 결정적 rng (셔플 고정)
const seq = () => {
  let x = 0.42;
  return () => {
    x = (x * 9301 + 49297) % 233280 / 233280;
    return x;
  };
};

test("buildMockExam: 모델링 10 + SQL 40, 모델링 먼저", () => {
  const ids = buildMockExam(bank, { modeling: 10, sql: 40 }, seq());
  assert.equal(ids.length, 50);
  const subjOf = (id: string) => bank.find((q) => q.id === id)!.subject;
  const dm = ids.filter((id) => subjOf(id) === "data_modeling");
  const sql = ids.filter((id) => subjOf(id) === "sql");
  assert.equal(dm.length, 10);
  assert.equal(sql.length, 40);
  // 앞 10개가 모두 모델링
  assert.ok(ids.slice(0, 10).every((id) => subjOf(id) === "data_modeling"));
});

test("buildMockExam: 은행이 부족하면 있는 만큼", () => {
  const small = [mk("m0", "data_modeling"), mk("s0", "sql"), mk("s1", "sql")];
  const ids = buildMockExam(small, { modeling: 10, sql: 40 }, seq());
  assert.equal(ids.length, 3);
});

test("scoreMock: 만점 → 100, 합격", () => {
  const ids = buildMockExam(bank, { modeling: 10, sql: 40 }, seq());
  const correctById = Object.fromEntries(ids.map((id) => [id, true]));
  const r = scoreMock({ questions: bank, ids, correctById, durationSec: 100 });
  assert.equal(r.dataModeling, 20);
  assert.equal(r.sql, 80);
  assert.equal(r.score, 100);
  assert.equal(r.correct, 50);
  assert.equal(r.passed, true);
});

test("scoreMock: 모델링 전정답 + SQL 절반 → 60점 합격", () => {
  const ids = buildMockExam(bank, { modeling: 10, sql: 40 }, seq());
  const correctById: Record<string, boolean> = {};
  let sqlSeen = 0;
  for (const id of ids) {
    const q = bank.find((x) => x.id === id)!;
    if (q.subject === "data_modeling") correctById[id] = true;
    else correctById[id] = sqlSeen++ < 20; // 40개 중 20개 정답
  }
  const r = scoreMock({ questions: bank, ids, correctById, durationSec: 100 });
  assert.equal(r.dataModeling, 20);
  assert.equal(r.sql, 40);
  assert.equal(r.score, 60);
  assert.equal(r.passed, true);
});

test("scoreMock: 총점 60이어도 과목 과락이면 불합격", () => {
  const ids = buildMockExam(bank, { modeling: 10, sql: 40 }, seq());
  const correctById: Record<string, boolean> = {};
  // 모델링 1/10(10% → 과락), SQL 전부 정답
  let dmSeen = 0;
  for (const id of ids) {
    const q = bank.find((x) => x.id === id)!;
    if (q.subject === "data_modeling") correctById[id] = dmSeen++ < 1;
    else correctById[id] = true;
  }
  const r = scoreMock({ questions: bank, ids, correctById, durationSec: 100 });
  assert.equal(r.dataModeling, 2); // 1/10*20
  assert.equal(r.sql, 80);
  assert.equal(r.score, 82);
  assert.equal(r.passed, false, "모델링 40% 미만 과락으로 불합격");
});

test("scoreMock: 미응답(누락)은 오답 처리", () => {
  const ids = buildMockExam(bank, { modeling: 10, sql: 40 }, seq());
  const correctById = {}; // 아무도 안 맞힘(= 미응답 전부)
  const r = scoreMock({ questions: bank, ids, correctById, durationSec: 100 });
  assert.equal(r.score, 0);
  assert.equal(r.correct, 0);
  assert.equal(r.passed, false);
});
