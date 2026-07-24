import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const TMP = process.argv[2];
let fail = 0;
const ok = (c,m)=>{ console.log((c?"ok  - ":"FAIL- ")+m); if(!c) fail=1; };

const b = await chromium.launch({ executablePath: EXE, args:["--no-sandbox"] });
const ctx = await b.newContext({ acceptDownloads: true, viewport:{width:390,height:844} });
const page = await ctx.newPage();

await page.goto(`${BASE}/settings`, { waitUntil:"networkidle" });
await page.evaluate(() => {
  localStorage.setItem("sqld.attempts", JSON.stringify([
    {id:"a1",questionId:"q007",selectedIndex:1,isCorrect:true,confidence:"sure",answeredAt:"2026-07-23T00:00:00Z"},
    {id:"a2",questionId:"q010",selectedIndex:0,isCorrect:false,confidence:"guess",answeredAt:"2026-07-23T01:00:00Z"},
  ]));
});
await page.goto(`${BASE}/settings`, { waitUntil:"networkidle" });

// 내보내기 → 다운로드 캡처
const [dl] = await Promise.all([
  page.waitForEvent("download"),
  page.locator("button", { hasText:"백업 내보내기" }).click(),
]);
const path = `${TMP}/${dl.suggestedFilename()}`;
await dl.saveAs(path);
const bundle = JSON.parse(readFileSync(path,"utf8"));
ok(bundle.app==="sqld-30day" && bundle.attempts.length===2, `내보내기 번들 정상 (attempts=${bundle.attempts.length})`);

// 초기화
await page.locator("button", { hasText:"학습 기록 초기화" }).click();
await page.waitForSelector("[role=dialog]");
await page.locator("[role=dialog] button", { hasText:"초기화" }).click();
await page.waitForTimeout(300);
const afterReset = await page.evaluate(()=>JSON.parse(localStorage.getItem("sqld.attempts")||"[]").length);
ok(afterReset===0, `초기화 후 기록 0 (${afterReset})`);

// 가져오기(복원)
await page.setInputFiles('input[type=file]', path);
await page.waitForTimeout(400);
const afterImport = await page.evaluate(()=>JSON.parse(localStorage.getItem("sqld.attempts")||"[]").length);
ok(afterImport===2, `가져오기 복원 성공 (${afterImport})`);
ok((await page.locator("text=복원 완료").count())>0, "복원 완료 토스트");

await b.close();
console.log(fail?"\nBACKUP SMOKE FAILED":"\nBACKUP SMOKE PASSED");
process.exit(fail);
