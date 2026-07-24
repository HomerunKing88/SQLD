import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2] || ".";
let fail = 0;
const ok = (c,m)=>{ console.log((c?"ok  - ":"FAIL- ")+m); if(!c) fail=1; };
const b = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
p.on("pageerror", e=>{ console.error("PAGE ERROR:", e.message); fail=1; });
p.on("dialog", d=>d.accept());
await p.goto(`${BASE}/study`, { waitUntil:"networkidle" });
// 최대 20문항 넘기며 '주어진 데이터'가 있는(sqlSteps) 문제를 찾아 제출 전 상태 캡처
let found=false;
for (let i=0;i<20;i++){
  await p.waitForSelector("text=/\\d+ \\/ \\d+/");
  const hasGiven = await p.locator("text=주어진 데이터").count();
  const stem = await p.locator(".card p.font-semibold").first().innerText().catch(()=>"");
  if (hasGiven>0){
    // 제출 전에 표(테이블)가 보이는지
    const tables = await p.locator("table").count();
    ok(tables>0, `제출 전 '주어진 데이터' 표 노출 (${tables}개 테이블) — "${stem.slice(0,30)}"`);
    await p.screenshot({ path:`${DIR}/given-before.png`, fullPage:true });
    found=true;
    break;
  }
  // 다음 문제로: 보기 선택 → 정답 확인 → 다음
  await p.locator("button:has(span.rounded-full)").first().click();
  await p.locator("button", { hasText:"정답 확인" }).click();
  await p.locator("button", { hasText:/다음 문제|결과 보기/ }).click();
}
ok(found, "sqlSteps 문제를 학습 세트에서 발견");
await b.close();
console.log(fail?"\nGIVEN SMOKE FAILED":"\nGIVEN SMOKE PASSED");
process.exit(fail);
