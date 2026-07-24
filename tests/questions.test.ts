// 문제 은행 무결성 검증 — 정답키/분류 오류를 사전 차단
import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../src/data/questions.ts";
import { CATEGORY_SUBJECT } from "../src/lib/types.ts";

test("문항 수 & id 중복 없음", () => {
  assert.ok(QUESTIONS.length >= 60, `문항 ${QUESTIONS.length}개 (기대 >=60)`);
  const ids = QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "중복 id 존재");
});

test("모든 문항: answerIndex가 choices 범위 내", () => {
  for (const q of QUESTIONS) {
    assert.ok(
      Number.isInteger(q.answerIndex) &&
        q.answerIndex >= 0 &&
        q.answerIndex < q.choices.length,
      `${q.id}: answerIndex(${q.answerIndex})가 보기 범위를 벗어남`
    );
    assert.ok(q.choices.length >= 2, `${q.id}: 보기 2개 미만`);
    assert.ok(q.stem.trim().length > 0, `${q.id}: 지문 비어있음`);
    assert.ok(q.explanation.trim().length > 0, `${q.id}: 해설 비어있음`);
  }
});

test("subject와 category 매핑 일치", () => {
  for (const q of QUESTIONS) {
    assert.equal(
      CATEGORY_SUBJECT[q.category],
      q.subject,
      `${q.id}: category(${q.category})와 subject(${q.subject}) 불일치`
    );
  }
});

test("SQL 문항 비중이 데이터모델링보다 높다(목표 반영)", () => {
  const sql = QUESTIONS.filter((q) => q.subject === "sql").length;
  const dm = QUESTIONS.filter((q) => q.subject === "data_modeling").length;
  assert.ok(sql > dm, `SQL ${sql} vs 모델링 ${dm}`);
});

test("sqlSteps가 있으면 6단계 흐름 구조가 유효", () => {
  for (const q of QUESTIONS) {
    if (!q.sqlSteps) continue;
    assert.ok(q.sqlSteps.steps.length > 0, `${q.id}: sqlSteps 비어있음`);
    for (const s of q.sqlSteps.steps) {
      assert.ok(s.clause && s.table, `${q.id}: 단계 구조 불완전`);
      assert.ok(
        Array.isArray(s.table.columns) && Array.isArray(s.table.data),
        `${q.id}: 단계 테이블 형식 오류`
      );
      for (const row of s.table.data) {
        assert.equal(
          row.length,
          s.table.columns.length,
          `${q.id}/${s.clause}: 행 길이가 컬럼 수와 불일치`
        );
      }
    }
  }
});
