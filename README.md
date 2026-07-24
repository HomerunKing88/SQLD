# SQLD 30일 스퍼트 📱

SQLD 시험 합격을 위한 **개인 학습용 모바일 우선 웹앱**.
출퇴근 중 스마트폰으로 하루 20~30분, 한 손으로 사용하도록 설계했습니다.

> 목표: 이전 52점(합격 60점)에서 **SQL 과목 4~6문제 추가 확보**.
> 데이터모델링(이미 80%)은 유지하고, SQL 과목에 문제 비중·복습을 집중합니다.

## 핵심 기능

- ⏳ **D-day** — 시험일까지 카운트다운
- 📝 **오늘의 문제 15~25개** — 복습 대기 + 신규(SQL 가중) 자동 구성
- ✅ **객관식 풀이** + 문제별 **확신도**(확실함/애매함/찍음)
- 💡 즉시 **정답·해설**
- 🪜 **SQL 단계별 실행** — FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 중간 결과 표
- 🔁 **오답 자동 저장** + **확신도 반영 간격 반복 복습**(1일 / 3일 / 7일)
- 📊 **영역별·유형별·태그별 정답률**, **예상 점수**(실제 배점 20:80 반영)
- 🔥 **일일 목표·연속 학습일(스트릭)**, **세션 이어풀기**(새로고침/앱 전환 후 계속)
- 🎯 **취약 유형 집중 특훈**, **취약 개념 TOP**(태그 드릴다운)
- 📜 **기출 유형 모드** — 출제기준·빈출 개념 기반 오리지널 문항(`docs/GICHUL_CONCEPTS.md`)
- 📝 **모의고사 모드** — 실배점 채점·타이머·과락 판정, 틀린 문항 자동 복습 반영
- 📴 **PWA** — 오프라인 동작, 홈 화면 설치 가능

## 기술 스택

Next.js 15 (App Router) · TypeScript · Tailwind CSS · PWA · Supabase(선택)

저장은 기본적으로 **브라우저 localStorage**(무로그인·오프라인)를 사용합니다.
Supabase는 여러 기기 동기화가 필요할 때 쓰는 **선택 사항**입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버
npm test         # 핵심 로직 단위 테스트
```

## 프로젝트 구조

```
src/
  app/            # 화면 (홈 / 학습 / 오답 / 통계 / 설정)
  components/     # QuestionCard, SqlSteps, BottomNav ...
  lib/            # 도메인 로직
    types.ts        타입·분류 체계
    srs.ts          간격 반복 복습 (1·3·7일)
    scoring.ts      정답률·예상점수(배점 20:80)
    session.ts      오늘의 문제 세트 구성 (SQL 가중)
    repository.ts   저장소 추상화 (localStorage 구현)
    store.tsx       React 전역 상태
  data/questions.ts # 시드 94문항 (기출유형 30 포함, SQL 75 : 모델링 19)
docs/             # 설계 문서(DESIGN.md) / 화면·흐름(FLOW.md)
supabase/         # (선택) schema.sql, seed.sql
scripts/          # 아이콘/시드 생성, 스모크 테스트
```

## 문제 추가하기

`src/data/questions.ts` 배열에 문항을 추가하면 됩니다. SQL 문제에
`sqlSteps`를 넣으면 단계별 실행 화면이 자동 렌더됩니다.
Supabase를 쓴다면 아래로 seed 를 다시 생성하세요.

```bash
npx tsx scripts/gen-seed.ts   # questions.ts -> supabase/seed.sql
```

## Supabase 사용(선택)

1. Supabase 프로젝트 생성 후 `supabase/schema.sql` 실행
2. `supabase/seed.sql` 실행(문제 적재)
3. `repository.ts`를 Supabase 클라이언트 구현으로 교체하고
   `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정

> 1인 개인용 기준이라 인증 없이 동작합니다. 공개 배포 시에는 RLS 정책을 추가하세요.

## 제외 범위

커뮤니티 · 결제 · 랭킹 · 앱스토어 배포 · 실시간 AI 문제 생성 · 복잡한 관리자 —
개인 학습 목표에 불필요하므로 의도적으로 제외했습니다.
