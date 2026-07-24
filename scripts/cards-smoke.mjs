import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2] || ".";
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok  - " : "FAIL- ") + m); if (!c) fail = 1; };

const b = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => { console.error("PAGE ERROR:", e.message); fail = 1; });

// 홈에서 개념 카드 진입점
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
ok((await page.locator("text=빈출 개념 카드").count()) > 0, "홈에 빈출 개념 카드 진입점");

await page.goto(`${BASE}/cards`, { waitUntil: "networkidle" });
await page.waitForSelector("text=탭하면 뒤집혀요");
await page.screenshot({ path: `${DIR}/cards-front.png` });
ok(true, "카드 앞면 표시");

// 진행 표시 파싱 (1/N)
const progTxt = await page.locator("text=/\\d+\\/\\d+/").first().innerText();
const total = parseInt(progTxt.split("/")[1], 10);
ok(total >= 20, `덱 크기 ${total}`);

// 카드 탭 → 뒤집기(핵심 노출)
await page.locator("button", { hasText: "탭하면 뒤집혀요" }).click();
await page.waitForSelector("text=핵심");
await page.screenshot({ path: `${DIR}/cards-back.png` });
ok((await page.locator("text=핵심").count()) > 0, "탭하면 뒷면(핵심) 노출");

// '다시' 채점 → 다음 카드로, 진행 증가
await page.locator("button", { hasText: "다시" }).click();
await page.waitForSelector("text=탭하면 뒤집혀요");
const prog2 = await page.locator("text=/\\d+\\/\\d+/").first().innerText();
ok(parseInt(prog2.split("/")[0], 10) === 2, "채점 후 다음 카드로 진행");

// localStorage에 카드 진행 저장 + '다시'는 again 등급
const cards = await page.evaluate(() => JSON.parse(localStorage.getItem("sqld.cards") || "{}"));
const ratings = Object.values(cards).map((c) => c.rating);
ok(Object.keys(cards).length === 1 && ratings[0] === "again", "카드 진행 저장(again)");

// 그룹 필터 SQL 전환 시 리셋
await page.locator("button.chip", { hasText: "SQL" }).click();
await page.waitForSelector("text=탭하면 뒤집혀요");
const prog3 = await page.locator("text=/\\d+\\/\\d+/").first().innerText();
ok(parseInt(prog3.split("/")[0], 10) === 1, "그룹 전환 시 처음부터");

await b.close();
console.log(fail ? "\nCARDS SMOKE FAILED" : "\nCARDS SMOKE PASSED");
process.exit(fail);
