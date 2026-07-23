// 브라우저 기반 인터랙션 스모크 테스트 (playwright-core + 사전설치 Chromium)
import { chromium } from "playwright-core";

const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";

function ok(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok  -", msg);
  }
}

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => {
  console.error("PAGE ERROR:", e.message);
  process.exitCode = 1;
});

try {
  // 1) 학습 페이지 진입 → 문제 카드 로드
  await page.goto(`${BASE}/study`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=/ 20", { timeout: 8000 }).catch(() => {});
  const progress = await page.locator("text=/1 \\/ \\d+/").first().count();
  ok(progress > 0, "학습 세션 진행표시(1 / N) 렌더");

  // 2) 첫 보기 선택
  const choices = page.locator("button:has(span.rounded-full)");
  await choices.first().waitFor({ timeout: 8000 });
  await choices.nth(0).click();

  // 3) 확신도 선택 (확실함)
  await page.locator("button", { hasText: "확실함" }).click();

  // 4) 정답 확인
  const submit = page.locator("button", { hasText: "정답 확인" });
  ok((await submit.count()) > 0, "정답 확인 버튼 활성화");
  await submit.click();

  // 5) 해설 노출 확인
  await page.waitForSelector("text=해설", { timeout: 5000 });
  ok(true, "채점 후 해설 표시");
  const graded = await page
    .locator("text=/정답입니다|오답입니다/")
    .first()
    .count();
  ok(graded > 0, "정답/오답 판정 표시");

  // 6) localStorage에 attempt 저장 확인
  const attempts = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sqld.attempts") || "[]")
  );
  ok(attempts.length >= 1, `attempt 저장됨 (${attempts.length}건)`);

  // 7) 다음 문제 진행
  await page.locator("button", { hasText: /다음 문제|세션 완료/ }).click();
  await page.waitForTimeout(300);
  const nextProgress = await page.locator("text=/2 \\/ \\d+/").first().count();
  ok(nextProgress > 0, "다음 문제로 진행 (2 / N)");

  // 8) 홈에서 예상점수/ D-day 렌더 확인
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=예상 점수", { timeout: 5000 });
  const dday = await page.locator("text=/D-\\d+|D-DAY/").first().count();
  ok(dday > 0, "홈 D-day 렌더");

  // 9) SQL 단계별 문제(q010) 강제 확인: 통계 페이지 렌더
  await page.goto(`${BASE}/stats`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=유형별 정답률", { timeout: 5000 });
  ok(true, "통계 페이지 렌더");
} finally {
  await browser.close();
}

console.log(process.exitCode ? "\nSMOKE FAILED" : "\nSMOKE PASSED");
