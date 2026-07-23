import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2] || ".";

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

// 대시보드가 채워지도록 몇 문제 미리 풀이 시드
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  const now = Date.now();
  const iso = (d) => new Date(now - d * 86400000).toISOString();
  const at = [
    ["d1", true], ["d2", true], ["q001", true], ["q002", false],
    ["q007", true], ["q008", true], ["q009", true], ["q010", false],
    ["q012", true], ["q013", false], ["q014", true], ["q015", true],
  ].map(([q, ok], i) => ({
    id: "seed" + i, questionId: q, selectedIndex: 0, isCorrect: ok,
    confidence: i % 3 === 0 ? "guess" : "sure", answeredAt: iso(i),
  }));
  localStorage.setItem("sqld.attempts", JSON.stringify(at));
  localStorage.setItem("sqld.reviews", JSON.stringify([
    { questionId: "q010", stage: 0, dueAt: iso(0), updatedAt: iso(0) },
  ]));
});

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector("text=예상 점수");
await page.screenshot({ path: `${DIR}/01-home.png` });

await page.goto(`${BASE}/study`, { waitUntil: "networkidle" });
await page.waitForSelector("text=/1 \\/ \\d+/");
await page.screenshot({ path: `${DIR}/02-study-question.png`, fullPage: true });

// SQL 단계별 문제를 강제로 보기 위해 첫 문제 채점 후 해설 화면 캡처
const choices = page.locator("button:has(span.rounded-full)");
await choices.first().waitFor();
await choices.nth(0).click();
await page.locator("button", { hasText: "확실함" }).click();
await page.locator("button", { hasText: "정답 확인" }).click();
await page.waitForSelector("text=해설");
await page.screenshot({ path: `${DIR}/03-study-explanation.png`, fullPage: true });

await page.goto(`${BASE}/stats`, { waitUntil: "networkidle" });
await page.waitForSelector("text=유형별 정답률");
await page.screenshot({ path: `${DIR}/04-stats.png`, fullPage: true });

await page.goto(`${BASE}/review`, { waitUntil: "networkidle" });
await page.waitForSelector("text=오답노트");
await page.screenshot({ path: `${DIR}/05-review.png`, fullPage: true });

await browser.close();
console.log("screenshots written to", DIR);
