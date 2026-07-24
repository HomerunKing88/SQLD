// 2026 SQLD 시험 일정 헬퍼
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SQLD_EXAMS,
  nextExamSession,
  sessionForDate,
} from "../src/data/examSchedule.ts";

test("SQLD_EXAMS: 2026 4회차 정의", () => {
  assert.equal(SQLD_EXAMS.length, 4);
  assert.deepEqual(
    SQLD_EXAMS.map((e) => e.date),
    ["2026-03-07", "2026-05-31", "2026-08-22", "2026-11-14"]
  );
});

test("nextExamSession: 오늘 기준 다음 회차", () => {
  // 2026-07-24 → 다음은 제62회(8/22)
  assert.equal(nextExamSession(new Date("2026-07-24T09:00:00")).round, 62);
  // 시험 당일은 아직 '지나지 않음'으로 포함
  assert.equal(nextExamSession(new Date("2026-05-31T09:00:00")).round, 61);
  // 마지막 이후 → 마지막 회차 반환
  assert.equal(nextExamSession(new Date("2026-12-01T09:00:00")).round, 63);
});

test("sessionForDate: 날짜로 회차 조회", () => {
  assert.equal(sessionForDate("2026-08-22")?.round, 62);
  assert.equal(sessionForDate("2026-01-01"), null);
});
