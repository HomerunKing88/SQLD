import { test } from "node:test";
import assert from "node:assert/strict";
import { CONCEPTS } from "../src/data/concepts";
import { buildCardDeck, deckSummary, groupOf } from "../src/lib/cards";
import type { CardProgress, CardRating } from "../src/lib/types";

function prog(entries: Record<string, CardRating>): Record<string, CardProgress> {
  const out: Record<string, CardProgress> = {};
  for (const [id, rating] of Object.entries(entries)) {
    out[id] = { conceptId: id, rating, seenCount: 1, updatedAt: "2026-01-01" };
  }
  return out;
}

test("개념 카드 무결성: id 고유·필수 필드·유효 카테고리", () => {
  const ids = new Set<string>();
  const validCats = new Set([
    "modeling_basics",
    "modeling_performance",
    "sql_basics",
    "sql_advanced",
    "sql_management",
  ]);
  for (const c of CONCEPTS) {
    assert.ok(!ids.has(c.id), `중복 id: ${c.id}`);
    ids.add(c.id);
    assert.ok(c.title.trim().length > 0, `${c.id} title 비어있음`);
    assert.ok(c.front.trim().length > 0, `${c.id} front 비어있음`);
    assert.ok(c.summary.trim().length > 0, `${c.id} summary 비어있음`);
    assert.ok(validCats.has(c.category), `${c.id} 잘못된 카테고리`);
    assert.ok(Array.isArray(c.tags), `${c.id} tags 배열 아님`);
  }
  assert.ok(CONCEPTS.length >= 20, "개념 카드가 충분히 많아야 함");
});

test("그룹 필터: sql / modeling 분리", () => {
  const sql = buildCardDeck(CONCEPTS, {}, "sql");
  const modeling = buildCardDeck(CONCEPTS, {}, "modeling");
  assert.ok(sql.every((c) => groupOf(c) === "sql"));
  assert.ok(modeling.every((c) => groupOf(c) === "modeling"));
  assert.equal(sql.length + modeling.length, CONCEPTS.length);
});

test("덱 정렬: '다시' > 미학습 > '애매' > '숙지' 순으로 앞에", () => {
  // 임의로 몇 개 카드 진행 상태 부여
  const [a, b, c, d] = CONCEPTS.map((x) => x.id);
  const p = prog({ [a]: "known", [b]: "again", [c]: "ok" });
  // d는 미학습(진행 없음)
  const deck = buildCardDeck(CONCEPTS, p, "all");
  const idxOf = (id: string) => deck.findIndex((x) => x.id === id);
  // again(b)이 맨 앞 그룹, known(a)은 맨 뒤 그룹
  assert.ok(idxOf(b) < idxOf(d), "again은 미학습보다 앞");
  assert.ok(idxOf(d) < idxOf(c), "미학습은 애매(ok)보다 앞");
  assert.ok(idxOf(c) < idxOf(a), "애매(ok)는 숙지(known)보다 앞");
});

test("덱 정렬은 결정적(같은 입력 → 같은 순서)", () => {
  const p = prog({ [CONCEPTS[0].id]: "known" });
  const d1 = buildCardDeck(CONCEPTS, p, "all").map((c) => c.id);
  const d2 = buildCardDeck(CONCEPTS, p, "all").map((c) => c.id);
  assert.deepEqual(d1, d2);
});

test("요약: 숙지/학습중/미학습 카운트", () => {
  const [a, b, c] = CONCEPTS.map((x) => x.id);
  const p = prog({ [a]: "known", [b]: "again", [c]: "ok" });
  const s = deckSummary(CONCEPTS, p, "all");
  assert.equal(s.total, CONCEPTS.length);
  assert.equal(s.known, 1);
  assert.equal(s.learning, 2); // again + ok
  assert.equal(s.unseen, CONCEPTS.length - 3);
  assert.ok(s.masteredRatio > 0 && s.masteredRatio < 1);
});
