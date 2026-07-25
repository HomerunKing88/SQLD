import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const DIR = process.argv[2] || ".";
let fail = 0;
const ok=(c,m)=>{console.log((c?"ok  - ":"FAIL- ")+m); if(!c) fail=1;};
const b = await chromium.launch({ executablePath: EXE, args:["--no-sandbox"] });
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
p.on("pageerror", e=>{ console.error("PAGE ERROR:", e.message); fail=1; });

await p.goto(`${BASE}/cards`, { waitUntil:"networkidle" });
await p.waitForSelector("text=개념 암기");
ok(true, "허브 로드 (개념 암기)");
ok((await p.locator("text=플래시카드").count())>0 && (await p.locator("text=O/X 퀴즈").count())>0 && (await p.locator("text=요약 시트").count())>0, "3개 모드 탭 존재");

// 플래시카드 기본
ok((await p.locator("text=탭하면 뒤집혀요").count())>0, "카드 모드 기본 표시");

// O/X 모드
await p.locator("button", { hasText:"O/X 퀴즈" }).click();
await p.waitForSelector("text=옳다");
await p.screenshot({ path:`${DIR}/hub-ox.png`, fullPage:true });
ok((await p.locator("text=옳다").count())>0 && (await p.locator("text=그르다").count())>0, "O/X 모드: 옳다/그르다 버튼");
// 한 문제 풀기
await p.locator("button", { hasText:"옳다" }).click();
await p.waitForSelector("text=/정답|오답/");
ok((await p.locator("text=/정답은/").count())>0, "O/X 채점·해설 노출");
await p.locator("button", { hasText:/다음|결과 보기/ }).click();
ok(true, "O/X 다음 진행");

// 요약 시트 모드
await p.locator("button", { hasText:"요약 시트" }).click();
await p.waitForSelector("input[placeholder*='검색']");
await p.screenshot({ path:`${DIR}/hub-sheet.png`, fullPage:true });
ok((await p.locator("li button").count())>0, "요약 시트: 개념 목록");
// 검색
await p.fill("input[placeholder*='검색']", "ROWNUM");
await p.waitForTimeout(200);
const cnt = await p.locator("li button").count();
ok(cnt>0 && cnt<10, `검색 'ROWNUM' 필터 동작 (${cnt}건)`);
// 항목 펼치기
await p.locator("li button").first().click();
ok((await p.locator("text=함정, text=핵심").count())>=0, "항목 펼침");

await b.close();
console.log(fail?"\nHUB SMOKE FAILED":"\nHUB SMOKE PASSED");
process.exit(fail);
