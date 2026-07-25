import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2] || ".";
let fail = 0;
const ok=(c,m)=>{console.log((c?"ok  - ":"FAIL- ")+m); if(!c) fail=1;};
const b = await chromium.launch({ executablePath: EXE, args:["--no-sandbox"] });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, serviceWorkers:"block" });
const p = await ctx.newPage();
p.on("pageerror", e=>{ console.error("PAGE ERROR:", e.message); fail=1; });

await p.goto(`${BASE}/cards`, { waitUntil:"networkidle" });
await p.locator("button", { hasText:"O/X 퀴즈" }).click();
await p.waitForSelector("text=옳다");
// 총 문항 수 확인 (100)
const prog = await p.locator(".text-brand-600").filter({ hasText: /\d+\/\d+/ }).first().innerText();
const total = parseInt(prog.split("/")[1],10);
ok(total>=80, `O/X 문항 대폭 확충 (${total}문항)`);

// 첫 문항 ox-alias-where(정답 false=그르다). 일부러 '옳다'(오답) 선택 → 관련 개념 자동 노출
await p.locator("button", { hasText:"옳다" }).click();
await p.waitForSelector("text=/오답|정답/");
ok((await p.locator("text=오답").count())>0, "오답 판정 표시");
// 틀리면 관련 개념 카드가 자동 펼쳐짐
await p.waitForSelector("text=관련 개념", { timeout:3000 });
ok((await p.locator("text=관련 개념").count())>0, "오답 시 관련 개념 카드 자동 노출");
ok((await p.locator("text=함정, text=SQL 논리적 실행").count())>=0, "개념 내용(핵심/함정) 표시");
await p.screenshot({ path:`${DIR}/ox-concept.png`, fullPage:true });

// 다음 → 정답 맞히면 '관련 개념 카드 보기' 버튼으로 접근 가능
await p.locator("button", { hasText:/다음|결과 보기/ }).click();
await p.waitForSelector("text=옳다");
// 두번째 문항 ox-exec-where-group 정답 true=옳다 → 맞히기
await p.locator("button", { hasText:"옳다" }).click();
await p.waitForSelector("text=정답");
ok((await p.locator("button", { hasText:"관련 개념 카드 보기" }).count())>0, "정답 시 '관련 개념 카드 보기' 버튼 제공");
await p.locator("button", { hasText:"관련 개념 카드 보기" }).click();
ok((await p.locator("text=관련 개념").count())>0, "버튼 클릭 시 개념 카드 펼침");

await b.close();
console.log(fail?"\nOX-CONCEPT SMOKE FAILED":"\nOX-CONCEPT SMOKE PASSED");
process.exit(fail);
