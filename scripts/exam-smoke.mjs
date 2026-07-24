import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2];
let fail = 0;
const ok = (c,m)=>{ console.log((c?"ok  - ":"FAIL- ")+m); if(!c) fail=1; };

const b = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("dialog", d => d.accept());
page.on("pageerror", e => { console.error("PAGE ERROR:", e.message); fail=1; });

await page.goto(`${BASE}/exam`, { waitUntil: "networkidle" });
await page.waitForSelector("text=모의고사 시작");
await page.screenshot({ path: `${DIR}/exam-intro.png` });
ok(true, "모의고사 시작 화면");

await page.locator("button", { hasText: "모의고사 시작" }).click();
await page.waitForSelector("text=/1 \\/ \\d+/");
const totalTxt = await page.locator("text=/1 \\/ \\d+/").first().innerText();
const total = parseInt(totalTxt.split("/")[1].trim(), 10);
ok(total > 0, `시험 진행 (총 ${total}문항)`);
ok((await page.locator("text=/⏱ \\d\\d:\\d\\d/").count()) > 0, "카운트다운 타이머 표시");
// 정답 비공개 확인: 채점 후에만 보이는 '해설'이 없어야 함
ok((await page.locator("text=해설").count()) === 0, "풀이 중 해설 비공개");

for (let i = 0; i < total; i++) {
  const choices = page.locator("button:has(span.rounded-full)");
  await choices.first().waitFor();
  await choices.nth(0).click();
  if (i < total - 1) {
    await page.locator("button", { hasText: /^다음$/ }).click();
  }
}
await page.locator("button", { hasText: "제출하기" }).click();
await page.waitForSelector("text=/\\/ 100/", { timeout: 8000 });
ok(true, "제출 후 결과 채점 화면");
const scoreShown = await page.locator("text=/합격까지|합격 기준/").count();
ok(scoreShown > 0, "합격/점수 판정 표시");
const mocks = await page.evaluate(() => JSON.parse(localStorage.getItem("sqld.mocks")||"[]"));
ok(mocks.length === 1, `모의고사 결과 저장됨 (${mocks.length}건)`);
const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem("sqld.attempts")||"[]"));
ok(attempts.length === total && attempts.every(a=>a.source==="mock"), `mock attempt 기록 ${attempts.length}건`);
await page.screenshot({ path: `${DIR}/exam-result.png` });

// 홈에 최근 모의고사 점수
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector("text=모의고사");
ok((await page.locator("text=/최근 \\d+점/").count()) > 0, "홈에 최근 모의고사 점수");

await b.close();
console.log(fail ? "\nEXAM SMOKE FAILED" : "\nEXAM SMOKE PASSED");
process.exit(fail);
