# 기출 유형 개념·해설 준비 자료 (SQLD)

> **저작권 원칙**: SQLD 실제 기출은 비공개이며, 온라인의 "복원문제"는 제3자 저작물이다.
> 이 문서는 그것을 복제하지 않는다. 대신 **공개된 출제기준·빈출 개념·함정 포인트**에
> 근거해, 같은 개념을 묻는 **오리지널 예제**와 **개념·해설**을 준비한다. 앱에는
> `기출유형` 태그로 반영해 "기출 스타일" 연습을 제공한다.

## 시험 구조(공식)
- 과목1 **데이터 모델링의 이해** 10문항(20점) · 과목2 **SQL 기본 및 활용** 40문항(80점)
- 총 50문항, 문항당 2점, **60점 이상 합격**, **과목별 40% 미만 과락**
- 목표(사용자): SQL 과목에서 +4~6문제 → 60~64점. 따라서 아래 준비도 **SQL 집중**.

## 활용 방식
- 각 항목 = `개념 요약` + `기출 포인트/함정` + `대표 예제(오리지널)` + `정답·해설`.
- 이 자료를 `src/data/questions.ts`의 `기출유형` 태그 문항으로 옮기고, 필요 시
  SQL 결과예측형은 `sqlSteps`(단계별 실행)로 시각화한다.

---

# 과목 2. SQL 기본 및 활용 (집중)

## S1. SQL 실행 순서 (최빈출)
- **개념**: 논리적 실행은 `FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`.
  작성 순서(SELECT 먼저)와 다르다.
- **함정**: SELECT의 컬럼 별칭(ALIAS)은 SELECT 이후 실행되는 **ORDER BY에서만** 사용 가능.
  WHERE/GROUP BY/HAVING에서는 별칭 사용 불가.
- **예제**: `SELECT sal*12 AS annual FROM emp WHERE annual > 3000` 은 오류인가?
  → **오류**(WHERE에서 별칭 annual 사용 불가). `WHERE sal*12 > 3000`로 써야 함.

## S2. NULL — 가로/세로 연산 & 비교 (최빈출 함정)
- **개념**: NULL은 '알 수 없음'. 0/공백과 다르다.
- **함정 3종**:
  1) 행 내 산술(가로): `100 + NULL = NULL`(0 아님).
  2) 집계(세로): `SUM/AVG/COUNT(컬럼)`는 NULL을 **제외**(0 치환 아님). `COUNT(*)`만 전체 행.
  3) 비교: `=`, `!=`로 NULL 비교 불가 → `IS NULL / IS NOT NULL`.
- **예제**: comm에 NULL 3개 포함 10행에서 `AVG(comm)`의 분모는? → **7**(NULL 제외).

## S3. NULL 관련 함수 (NVL/NVL2/NULLIF/COALESCE)
- **개념**: `NVL(a,b)` a가 NULL이면 b. `NVL2(a,b,c)` a가 NOT NULL이면 b, NULL이면 c.
  `NULLIF(a,b)` a=b면 NULL, 아니면 a. `COALESCE(...)` 첫 NOT NULL.
- **함정**: NVL2 인자 순서(NOT NULL일 때가 먼저). SQL Server는 `ISNULL`.
- **예제**: `NVL2(NULL, 'X', 'Y')` → **'Y'**.

## S4. 문자 함수 (SUBSTR/INSTR/LENGTH/REPLACE/LPAD)
- **개념**: `SUBSTR(s, 시작, 길이)`(1-base), `INSTR(s, 찾을문자)`(위치), `LENGTH`(길이).
- **함정**: Oracle vs SQL Server 함수명(SUBSTR/SUBSTRING, LENGTH/LEN, INSTR/CHARINDEX).
- **예제**: `SUBSTR('DATABASE', 5, 3)` → **'BAS'**.

## S5. 숫자 함수 (ROUND/TRUNC/CEIL/FLOOR/MOD/SIGN)
- **개념**: `ROUND(x,n)` 반올림, `TRUNC(x,n)` 버림, `CEIL` 올림(+∞), `FLOOR` 내림(−∞),
  `MOD(a,b)` 나머지, `SIGN` 부호.
- **함정**: 음수 CEIL/FLOOR. `CEIL(-1.5) = -1`, `FLOOR(-1.5) = -2`.
- **예제**: `TRUNC(157, -1)` → **150**(음수 자리수 = 정수부 절사).

## S6. CASE / DECODE
- **개념**: `CASE WHEN 조건 THEN ... ELSE ... END`. Oracle `DECODE(기준,값1,결과1,...,기본)`.
- **함정**: DECODE는 **= 비교만** 가능, CASE는 범위(>,<) 가능. CASE에 ELSE 없으면 미매칭 시 NULL.
- **예제**: `DECODE(grade,'A',1,'B',2,0)` ≡ `CASE WHEN grade='A' THEN 1 WHEN grade='B' THEN 2 ELSE 0 END`.

## S7. WHERE 연산자 & 우선순위
- **개념**: `BETWEEN a AND b`(경계 포함), `IN`, `LIKE`(`%` 다수, `_` 한 글자), `IS NULL`.
- **함정**: 우선순위 `NOT > AND > OR`. `A OR B AND C = A OR (B AND C)`.
- **예제**: 3글자이고 '김'으로 시작 → `LIKE '김__'`(언더스코어 2개).

## S8. GROUP BY / HAVING / 집계
- **개념**: 그룹 집계 조건은 **HAVING**(그룹 후), 행 필터는 **WHERE**(그룹 전).
- **함정**: GROUP BY에 없는 일반 컬럼은 SELECT에 못 씀. WHERE에 집계함수 불가.
- **예제**: 부서 평균급여 ≥ 300 → `GROUP BY dept HAVING AVG(sal) >= 300`.

## S9. COUNT 3형태
- `COUNT(*)` 전체 행(NULL 포함) / `COUNT(컬럼)` NULL 제외 / `COUNT(DISTINCT 컬럼)` 중복·NULL 제외.
- **예제**: dept가 [SALES,SALES,DEV,NULL]일 때 `COUNT(DISTINCT dept)` → **2**.

## S10. JOIN 종류 (INNER/OUTER/NATURAL/CROSS/SELF) (최빈출)
- **개념**: INNER(교집합), LEFT/RIGHT/FULL OUTER(미매칭 보존→NULL), NATURAL(동명 컬럼 자동),
  CROSS(m×n 카티션), SELF(자기 자신, 별칭 필수).
- **함정**: NATURAL JOIN에 `ON/USING` 병기 불가. OUTER 결과 행수 ≥ INNER.
- **예제(결과예측·sqlSteps 후보)**: LEFT JOIN에서 오른쪽 미매칭은 NULL 1행으로 보존.

## S11. 서브쿼리 분류
- **위치**: 스칼라(SELECT, 단일값) / 인라인뷰(FROM) / 중첩(WHERE·HAVING).
- **연관성**: 연관(메인 컬럼 참조, 행마다 실행) / 비연관(독립 1회).
- **반환**: 단일행(=,<) / 다중행(IN, ANY, ALL, EXISTS) / 다중컬럼.
- **함정**: 다중행에 `=` 쓰면 오류(→ IN). `> ALL` = 최댓값보다 큼, `> ANY` = 최솟값보다 큼.
- **예제**: `sal > ALL(SELECT sal ...)` → 서브쿼리 **최댓값**보다 커야 참.

## S12. 집합 연산자 (UNION/UNION ALL/INTERSECT/MINUS)
- **개념**: UNION(합집합·중복제거·정렬수반), UNION ALL(중복유지), INTERSECT(교), MINUS/EXCEPT(차).
- **함정**: 컬럼 **개수·타입 호환** 필요. 결과 컬럼명은 첫 SELECT 기준.
- **예제(결과예측)**: {A,B} UNION {B,C} → 3행(B 하나로), UNION ALL → 4행.

## S13. 그룹 함수 (ROLLUP/CUBE/GROUPING SETS/GROUPING)
- **개념**: `ROLLUP(a,b)` 계층 소계 (a,b)→(a)→() / `CUBE(a,b)` 모든 조합 소계 /
  `GROUPING()` 소계행 판별(1/0).
- **함정**: ROLLUP은 일방향, CUBE는 전방향. 소계 행의 그룹 컬럼은 NULL.
- **예제(결과예측)**: 부서 2개, `ROLLUP(dept)` → 소계 2 + 총계 1 = **3행**.

## S14. 윈도우 함수 (순위/행순서/비율)
- **순위**: `RANK`(1,2,2,4 건너뜀) / `DENSE_RANK`(1,2,2,3) / `ROW_NUMBER`(1,2,3,4 유일).
- **행순서**: `LAG`(이전), `LEAD`(다음), `FIRST_VALUE/LAST_VALUE`.
- **비율/분할**: `RATIO_TO_REPORT`, `PERCENT_RANK`, `NTILE(n)`.
- **함정**: 윈도우 함수는 **행을 줄이지 않음**(PARTITION BY ≠ GROUP BY). 프레임(ROWS BETWEEN ...).
- **예제**: 값 100,100,90 → RANK 1,1,3 / DENSE_RANK 1,1,2.

## S15. Top-N / ROWNUM (최빈출 함정)
- **개념**: Oracle `ROWNUM`은 **정렬 전에** 매겨짐. 상위 N은 **인라인뷰로 먼저 정렬** 후 바깥에서 ROWNUM.
- **함정**: `WHERE ROWNUM <= 3 ORDER BY ...`(오답, 정렬 전 절단). `TOP`은 SQL Server.
- **예제(결과예측)**: 상위 3명 → `SELECT * FROM (SELECT ... ORDER BY sal DESC) WHERE ROWNUM<=3`.

## S16. 계층형 질의 (CONNECT BY)
- **개념**: `START WITH`(루트) + `CONNECT BY PRIOR`(부모-자식 전개). `LEVEL`(깊이,루트=1),
  `SYS_CONNECT_BY_PATH`(경로), `CONNECT_BY_ISLEAF`(잎=1), `CONNECT_BY_ROOT`.
- **함정**: `PRIOR` 위치가 정방향/역방향을 결정. START WITH는 루트 지정(전개규칙 아님).

## S17. DML / MERGE
- **개념**: INSERT/UPDATE/DELETE. `MERGE ... WHEN MATCHED THEN UPDATE / WHEN NOT MATCHED THEN INSERT`.
- **함정**: DELETE(DML, 롤백 가능) vs TRUNCATE(DDL, 자동커밋·롤백 불가·공간반납) vs DROP(구조 삭제).

## S18. TCL (COMMIT/ROLLBACK/SAVEPOINT)
- **개념**: COMMIT 확정, ROLLBACK 취소, SAVEPOINT 부분 롤백 지점.
- **함정**: TRUNCATE는 DDL이라 ROLLBACK으로 복구 불가. DDL은 자동 커밋.

## S19. 제약조건 & 참조 무결성
- **개념**: PK(UNIQUE+NOT NULL, 테이블당 1개), UNIQUE(NULL 허용), CHECK, NOT NULL, FK.
- **참조 옵션**: `ON DELETE CASCADE`(자식 연쇄 삭제) / `SET NULL` / `RESTRICT·NO ACTION`(삭제 제한).
- **함정**: UNIQUE는 NULL 다수 허용. PK 두 개 불가(복합키는 가능).

## S20. DCL (GRANT/REVOKE/ROLE)
- **개념**: GRANT 부여, REVOKE 회수, ROLE 권한 묶음.
- **함정**: `WITH GRANT OPTION` → 부여받은 사용자가 재부여 가능.

---

# 과목 1. 데이터 모델링의 이해 (핵심만)

## D1. 3층 스키마 & 데이터 독립성
- 외부(뷰·다수)/개념(통합 논리)/내부(물리). **논리적 독립성**=개념↔외부, **물리적 독립성**=내부↔개념.

## D2. 엔터티/속성/식별자 분류
- 엔터티: 유형/개념/사건, 기본/중심/행위. 속성: 기본/설계/파생(계산값). 식별자: 주/보조,
  내부/외부, 단일/복합, 본질(원조)/인조(대리).
- **주식별자 4대**: 유일성·최소성·불변성·존재성.

## D3. 정규화 / 이상현상 / 함수종속
- 1NF(원자성)·2NF(부분함수종속 제거)·3NF(이행함수종속 제거)·BCNF(결정자).
- 이상현상: 삽입/갱신/삭제 → **정규화**로 해소. 정규화는 조인↑로 조회성능 저하 가능.

## D4. 반정규화 & 식별자 관계
- 반정규화: 조회성능↑ 대신 중복·정합성 부담↑(테이블 병합/분할/추가, 컬럼/관계 중복).
- 식별자 관계(부모PK→자식PK, 실선·강함) vs 비식별자(부모PK→자식 일반속성, 점선·약함).

## D5. 트랜잭션 ACID
- 원자성(All or Nothing)·일관성·고립성(중간결과 간섭 불가)·지속성(영구 저장).

---

# 앱 반영 계획(다음 단계 제안)
1. 위 S1~S20·D1~D5를 근거로 **오리지널 `기출유형` 문항 40~80개** 작성(SQL 집중),
   각 문항에 개념·해설·태그, 결과예측형은 `sqlSteps` 부여.
2. `questions.ts`에 `기출유형` 태그 추가 → 학습/특훈/모의고사에서 자동 활용.
3. (선택) "기출 유형 모드": `기출유형` 태그만 모아 회차 대비 집중 풀이.
4. 참고 교재로 KDATA 공식 「SQL 자격검정 실전문제」를 README에 링크(구매 안내).
