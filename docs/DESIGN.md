# SQLD 30일 스퍼트 — 설계 문서

개인 학습용 · 모바일 우선 · 출퇴근 20~30분 사용

---

## 1. 요구사항 정리

### 1.1 배경 / 목표

| 항목 | 값 |
| --- | --- |
| 이전 총점 | 52점 (합격 60점) |
| 데이터 모델링 | 16 / 20 |
| SQL 기본 및 활용 | 36 / 80 |
| **핵심 목표** | **SQL 과목에서 추가 4~6문제 확보 (→ 총점 60~64점)** |
| 학습 시간 | 하루 20~30분, 스마트폰 한 손 사용 |
| 기간 | 30일 |

> 데이터 모델링은 이미 80%로 안정권. **투자 대비 효과가 가장 큰 SQL 과목에 문제 비중과
> 복습 알고리즘을 집중**시킨다. 오늘의 문제 구성도 SQL:데이터모델링 = 대략 3:1로 가중.

### 1.2 기능 요구사항 (우선순위)

MVP (필수)
1. 시험일까지 **D-day** 표시
2. **오늘의 문제 15~25개** 자동 구성 (신규 + 복습 혼합, SQL 가중)
3. **객관식** 문제풀이 (한 손 UI, 하단 큰 버튼)
4. 문제별 **확신도**: 확실함 / 애매함 / 찍음
5. **정답 및 해설** 즉시 표시
6. **SQL 단계별 실행 결과**: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
7. **오답 자동 저장** (오답노트)
8. **간격 반복 복습**: 틀린 문제를 1일 / 3일 / 7일 뒤 재출제
9. **영역별·유형별 정답률**
10. **예상점수** (최근 풀이 기준)

제외 (요구사항에서 명시적으로 불필요)
- 커뮤니티 / 결제 / 랭킹 / 앱스토어 배포 / 실시간 AI 생성 / 복잡한 관리자

### 1.3 비기능 요구사항
- **모바일 우선**: 세로 화면, 엄지 도달 영역(하단)에 주요 조작.
- **오프라인 동작 (PWA)**: 지하철 등 네트워크 불안정 환경. 문제 데이터·진행상황을 로컬에 보관.
- **로그인 불필요**: 1인 개인용. 기기 로컬 저장이 기본, Supabase는 선택적 클라우드 동기화.
- 빠른 로딩, 20~30분 세션에 방해 없는 최소 탭 수.

---

## 2. 데이터 모델

SQLD 출제 기준(과목 구조)에 맞춘 분류 체계.

### 2.1 분류 체계 (과목 / 유형)

```
과목 1: 데이터 모델링의 이해   (subject = "data_modeling")
  - 데이터모델링의 이해          category = "modeling_basics"
  - 데이터 모델과 성능           category = "modeling_performance"

과목 2: SQL 기본 및 활용        (subject = "sql")
  - SQL 기본                    category = "sql_basics"
  - SQL 활용                    category = "sql_advanced"
  - 관리 구문                    category = "sql_management"
```

### 2.2 엔터티

**question (문제)**
| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | text (PK) | 예: `q001` |
| subject | enum | `data_modeling` \| `sql` |
| category | enum | 위 5개 유형 |
| difficulty | int (1~3) | 하/중/상 |
| stem | text | 문제 지문 |
| choices | text[] | 보기 4~5개 |
| answer_index | int | 정답 보기 인덱스(0-base) |
| explanation | text | 해설 |
| sql_steps | jsonb? | SQL 단계별 결과(선택). §2.4 |
| tags | text[] | 세부 키워드 (예: `JOIN`, `GROUP BY`) |

**attempt (풀이 기록)** — 모든 풀이를 append. 오답노트·통계·예상점수의 원천.
| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | |
| question_id | text (FK) | |
| selected_index | int | 사용자가 고른 보기 |
| is_correct | bool | |
| confidence | enum | `sure` \| `unsure` \| `guess` |
| answered_at | timestamptz | |

**review (복습 스케줄, SRS)** — 문제당 1행. 틀리면 생성/리셋.
| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| question_id | text (PK) | |
| stage | int | 0→1일, 1→3일, 2→7일, 3→졸업 |
| due_at | timestamptz | 다음 복습 예정일 |
| updated_at | timestamptz | |

**settings**
| 컬럼 | 값 |
| --- | --- |
| exam_date | 시험일 (D-day 계산) |
| daily_goal | 오늘의 문제 수 (기본 20) |
| sql_weight | SQL 가중치 (기본 0.7) |

### 2.3 복습 알고리즘 (간격 반복, 확신도 반영)

간격 테이블: `[1, 3, 7]` (일). 채점 결과 + **확신도**를 함께 반영한다(`nextReviewOnAnswer`).

- **틀리면**: `stage=0`, `due_at = now + 1일` (확신도 무관).
- **맞힘 + 확실함**: 아는 문제. 기존 복습 있으면 `stage += 1`(→3일→7일, `stage>=3`이면 졸업), 없으면 스케줄 없음.
- **맞힘 + 애매함/찍음**: 확실히 아는 게 아니므로,
  - 기존 복습 있으면 **단계 전진 없이** 현재 간격 뒤 재복습(실력이 굳을 때까지 유지),
  - 없으면 `stage=0`(1일 뒤)로 **새로 등록** → 취약 문제를 복습망에 포함.

> 이 규칙 덕분에 "찍어서 맞힌" 문제도 반드시 회수되어, SQL 취약 문제 보강이라는
> 핵심 목표에 직접 기여한다.

### 2.6 일일 진행 & 연속 학습일(스트릭)

별도 저장 없이 `attempts`에서 파생 계산(`streak.ts`).
- **오늘 진행률**: 오늘(로컬 날짜) 푼 고유 문제 수 / 하루 목표.
- **스트릭**: 연속 학습일. 오늘 학습했으면 오늘부터, 아직이면 어제까지 유지로 계산.
- 홈에서 목표 진행 막대 · 🔥 연속일 · 목표 달성 상태를 표시해 30일 습관을 유도.

### 2.7 세션 이어풀기

진행 중 세션(문제 세트/커서/문제별 답안)을 `sessionStorage`에 보관.
새로고침·앱 전환 후 재진입 시 **같은 지점에서 이어풀기**하며, 이미 채점된 문제는
재기록하지 않아 중복 집계를 막는다.

### 2.4 SQL 단계별 실행 (sql_steps)

논리적 실행 순서를 학습시키기 위해 각 단계의 중간 결과 테이블을 저장.

```jsonc
{
  "query": "SELECT dept, COUNT(*) c FROM emp WHERE sal > 200 GROUP BY dept HAVING COUNT(*) >= 2 ORDER BY c DESC",
  "steps": [
    { "clause": "FROM / JOIN", "desc": "emp 테이블 로드", "rows": [...] },
    { "clause": "WHERE",       "desc": "sal > 200 필터", "rows": [...] },
    { "clause": "GROUP BY",    "desc": "dept 로 그룹", "rows": [...] },
    { "clause": "HAVING",      "desc": "그룹 개수 >= 2", "rows": [...] },
    { "clause": "SELECT",      "desc": "dept, COUNT(*)", "rows": [...] },
    { "clause": "ORDER BY",    "desc": "c 내림차순", "rows": [...] }
  ]
}
```

각 `rows`는 `{columns: string[], data: any[][]}` 형태로 렌더링.

### 2.5 예상점수 산출

실제 SQLD 배점(과목1 20점/10문항, 과목2 80점/40문항, 문항당 2점)에 맞춰 환산.

```
과목별 최근 정답률 = 최근 N회 풀이 중 정답 비율 (문제 중복 시 최신 결과 사용)
예상 데이터모델링 점수 = round(정답률_dm * 20)
예상 SQL 점수         = round(정답률_sql * 80)
예상 총점             = 두 점수 합 (0~100)
```
최근 표본이 적으면 "표본 부족" 배지 표시.

---

## 3. 저장소 전략 (로컬 우선 + Supabase 선택)

- **기본**: 브라우저 `localStorage` (오프라인·무로그인). `repository` 인터페이스로 추상화.
- **선택**: `.env`에 Supabase 키가 있으면 클라우드 동기화 구현으로 교체 가능(스키마·시드 SQL 제공).
- 문제 원본(seed 64문항, SQL 48 : 모델링 16)은 앱 번들에 포함되어 오프라인에서도 항상 사용 가능.
- 은행 소진(하루 20 기준 ~3.5일) 이후에는 신규 대신 **복습·재출제·취약 특훈** 중심으로 전환되며,
  재출제 문항은 '신규'로 오표기하지 않는다(`TodaySet.reservedCount`).

구조:
```
lib/repository.ts        // 인터페이스 + 로컬(localStorage) 구현
lib/srs.ts               // 복습 간격 계산 (확신도 반영)
lib/scoring.ts           // 예상점수·정답률·태그별 정답률
lib/session.ts           // 오늘의 세트 / 취약 유형 특훈 세트
lib/streak.ts            // 일일 진행·연속 학습일
data/questions.ts        // seed 64문항 (요약본 기반)
supabase/schema.sql      // (선택) 테이블 DDL
supabase/seed.sql        // (선택) 문제 시드
```

### 2.8 취약 유형 특훈 & 태그 드릴다운

- **특훈 모드**(`/study?mode=drill`): 정답률 낮은 유형 + 최근 오답 + SQL 우선순위로
  세트를 구성(`buildWeakDrillSet`). '오늘의 세트'와 달리 취약 유형을 몰아서 출제한다.
  세션은 모드별로 저장되어 이어풀기와 충돌하지 않는다.
- **태그 드릴다운**(통계): 문제 태그(JOIN·NULL·ROWNUM 등) 단위 정답률을 집계
  (`accuracyByTag`/`weakTags`)해 '취약 개념 TOP'으로 표시 → 세부 약점을 콕 짚어 준다.
