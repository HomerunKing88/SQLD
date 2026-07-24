// C1 백업: 내보내기 번들 형태 & 가져오기 검증 로직
import { test } from "node:test";
import assert from "node:assert/strict";
import { repository } from "../src/lib/repository.ts";

test("exportBundle: 앱 식별자·버전·키를 포함한다", () => {
  const b = repository.exportBundle();
  assert.equal(b.app, "sqld-30day");
  assert.equal(typeof b.version, "number");
  assert.ok(Array.isArray(b.attempts));
  assert.ok(Array.isArray(b.reviews));
  assert.ok(Array.isArray(b.mocks));
  assert.ok(b.settings && typeof b.settings === "object");
});

test("importBundle: 잘못된 데이터는 거부(false)", () => {
  assert.equal(repository.importBundle(null), false);
  assert.equal(repository.importBundle("x"), false);
  assert.equal(repository.importBundle({}), false);
  assert.equal(repository.importBundle({ app: "other", attempts: [] }), false);
  assert.equal(repository.importBundle({ app: "sqld-30day" }), false); // attempts 없음
});

test("importBundle: 올바른 번들은 수용(true)", () => {
  const ok = repository.importBundle({
    app: "sqld-30day",
    version: 1,
    attempts: [],
    reviews: [],
    mocks: [],
    settings: { examDate: "", dailyGoal: 20, sqlWeight: 0.7 },
  });
  assert.equal(ok, true);
});
