import { test } from "node:test";
import assert from "node:assert/strict";
import { OX_ITEMS } from "../src/data/ox";
import { CONCEPTS } from "../src/data/concepts";

test("O/X 무결성: id 고유·필수 필드·불리언 정답·유효 카테고리", () => {
  const ids = new Set<string>();
  const validCats = new Set([
    "modeling_basics",
    "modeling_performance",
    "sql_basics",
    "sql_advanced",
    "sql_management",
  ]);
  for (const o of OX_ITEMS) {
    assert.ok(!ids.has(o.id), `중복 id: ${o.id}`);
    ids.add(o.id);
    assert.ok(o.statement.trim().length > 0, `${o.id} statement 비어있음`);
    assert.ok(o.explain.trim().length > 0, `${o.id} explain 비어있음`);
    assert.equal(typeof o.answer, "boolean", `${o.id} answer는 boolean`);
    assert.ok(validCats.has(o.category), `${o.id} 잘못된 카테고리`);
    assert.ok(Array.isArray(o.tags), `${o.id} tags 배열 아님`);
  }
  assert.ok(OX_ITEMS.length >= 80, "O/X 문항이 충분히 많아야 함");
});

test("O/X ↔ 개념 카드 연결: conceptId는 실제 개념을 가리켜야 함", () => {
  const conceptIds = new Set(CONCEPTS.map((c) => c.id));
  for (const o of OX_ITEMS) {
    assert.ok(o.conceptId, `${o.id}에 conceptId가 없음`);
    assert.ok(
      conceptIds.has(o.conceptId!),
      `${o.id}의 conceptId '${o.conceptId}'가 존재하지 않는 개념`
    );
  }
});

test("O/X 정답 분포: 참·거짓이 한쪽으로 치우치지 않음", () => {
  const t = OX_ITEMS.filter((o) => o.answer).length;
  const f = OX_ITEMS.length - t;
  // 최소 각 30% 이상 — 정답 패턴 암기 방지
  assert.ok(t >= OX_ITEMS.length * 0.3, `참 진술 비율 부족 (${t}/${OX_ITEMS.length})`);
  assert.ok(f >= OX_ITEMS.length * 0.3, `거짓 진술 비율 부족 (${f}/${OX_ITEMS.length})`);
});
