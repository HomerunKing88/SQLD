# SQLD 30일 코치

모바일에서 하루 20~30분씩 SQLD 합격을 준비하는 Next.js MVP입니다. 이전 52점에서 SQL 기본 및 활용의 추가 4~6문제를 목표로 설계했습니다.

## 설계
- **학습 흐름:** 오늘의 20문제 → 확신도 기록 → 즉시 해설 → 오답 1·3·7일 복습 → 분석 탭 예상 점수 확인.
- **데이터 모델:** `profiles`, `questions`, `attempts`, `review_queue`를 `supabase/schema.sql`에 정의했습니다. 오답 제출 시 1·3·7일 `review_queue` 레코드를 생성하도록 API 연결하면 됩니다.
- **MVP 범위:** 현재는 바로 체험할 수 있도록 20개 시드 문제와 클라이언트 상태를 사용합니다. Supabase URL/anon key를 연결하면 같은 모델에 영속화할 수 있습니다.

## 실행
```bash
npm install
npm run dev
npm run build
```

## 향후 개선
1. Supabase Auth와 `attempts`/`review_queue` 저장 연결
2. 날짜 기반 오늘의 출제·복습 큐 우선순위 적용
3. 실제 모의고사 입력과 영역·유형별 통계 집계
4. PWA 아이콘, 오프라인 문제 캐시 및 설치 안내 추가
