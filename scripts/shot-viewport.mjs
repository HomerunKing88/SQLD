import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const OUT = process.argv[2];

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/study`, { waitUntil: "networkidle" });
await page.waitForSelector("text=/1 \\/ \\d+/");
const choices = page.locator("button:has(span.rounded-full)");
await choices.first().waitFor();
await choices.nth(0).click();
await page.locator("button", { hasText: "확실함" }).click();
await page.locator("button", { hasText: "정답 확인" }).click();
await page.waitForSelector("text=해설");
// SQL 단계 영역까지 스크롤 (하단 고정 바가 콘텐츠 위에 뜨는지 확인)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
await page.waitForTimeout(300);
await page.screenshot({ path: OUT }); // 뷰포트만 (fullPage 아님)
await browser.close();
console.log("wrote", OUT);
