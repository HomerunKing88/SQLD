// 합격 트래커 & 일별 학습량
import { test } from "node:test";
import assert from "node:assert/strict";
import { passProjection } from "../src/lib/scoring.ts";
import { recentDailyStudy } from "../src/lib/streak.ts";
import type { Attempt } from "../src/lib/types.ts";

test("passProjection: 남은 점수·필요 문항(문항당 2점)", () => {
  assert.deepEqual(passProjection({ dataModeling: 16, sql: 36, total: 52, enoughSample: true, sample: 30 }), {
    pass: false,
    gap: 8,
    questionsNeeded: 4,
  });
  const p60 = passProjection({ dataModeling: 20, sql: 40, total: 60, enoughSample: true, sample: 30 });
  assert.equal(p60.pass, true);
  assert.equal(p60.gap, 0);
  assert.equal(p60.questionsNeeded, 0);
});

test("recentDailyStudy: 7일·오늘 마지막·mock 제외", () => {
  const now = new Date("2026-07-24T09:00:00");
  const day = (off: number) => {
    const d = new Date(2026, 6, 24 - off);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  };
  const at: Attempt[] = [
    { id: "1", questionId: "a", selectedIndex: 0, isCorrect: true, confidence: "sure", answeredAt: day(0), source: "study" },
    { id: "2", questionId: "b", selectedIndex: 0, isCorrect: true, confidence: "sure", answeredAt: day(0), source: "study" },
    { id: "3", questionId: "c", selectedIndex: 0, isCorrect: false, confidence: "guess", answeredAt: day(1), source: "study" },
    { id: "4", questionId: "d", selectedIndex: 0, isCorrect: true, confidence: "sure", answeredAt: day(0), source: "mock" }, // 제외
  ];
  const w = recentDailyStudy(at, 7, now);
  assert.equal(w.length, 7);
  assert.equal(w[6].count, 2, "오늘 학습 2(mock 제외)");
  assert.equal(w[5].count, 1, "어제 1");
  assert.equal(w[0].count, 0, "6일 전 0");
});
