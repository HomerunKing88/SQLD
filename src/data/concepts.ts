// 빈출 개념 카드(플래시카드) — 이동 중 한 손 반복 암기용.
// docs/GICHUL_CONCEPTS.md 의 S1~S20 · D1~D5 를 근거로 한 오리지널 요약 카드.
// 문제 풀이(무거움)와 달리, 개념·함정·예제를 빠르게 뒤집어 보며 반복 각인한다.
// 점수/정답률 통계에는 영향 없음(순수 암기 트랙).
import type { Concept } from "@/lib/types";

export const CONCEPTS: Concept[] = [
  // ── SQL 기본 ─────────────────────────────────────────
  {
    id: "c-sql-exec-order",
    category: "sql_basics",
    title: "SQL 논리적 실행 순서",
    front: "SELECT는 실제로 몇 번째로 실행될까?",
    summary:
      "FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. 작성 순서(SELECT 먼저)와 다르다.",
    trap:
      "SELECT의 컬럼 별칭(ALIAS)은 SELECT 이후 실행되는 ORDER BY에서만 사용 가능. WHERE·GROUP BY·HAVING에선 불가.",
    example:
      "SELECT sal*12 AS annual FROM emp WHERE annual>3000 → 오류. WHERE sal*12>3000 로 써야 함.",
    tags: ["실행순서", "ALIAS"],
  },
  {
    id: "c-null-arith",
    category: "sql_basics",
    title: "NULL 연산·비교",
    front: "100 + NULL 의 결과는?",
    summary:
      "NULL은 '알 수 없음'(0·공백 아님). 행 내 산술에 NULL이 끼면 결과도 NULL.",
    trap:
      "NULL 비교는 =, != 불가 → IS NULL / IS NOT NULL 사용. 집계함수 SUM/AVG/COUNT(컬럼)는 NULL을 제외(0 치환 아님).",
    example: "comm에 NULL 3개 포함 10행 → AVG(comm)의 분모는 7(NULL 제외).",
    tags: ["NULL", "집계"],
  },
  {
    id: "c-null-func",
    category: "sql_basics",
    title: "NULL 처리 함수",
    front: "NVL2(NULL, 'X', 'Y') 의 값은?",
    summary:
      "NVL(a,b): a가 NULL이면 b. NVL2(a,b,c): a가 NOT NULL이면 b, NULL이면 c. NULLIF(a,b): a=b면 NULL. COALESCE: 첫 NOT NULL.",
    trap: "NVL2는 인자 순서 주의(NOT NULL일 때가 먼저). SQL Server는 ISNULL.",
    example: "NVL2(NULL,'X','Y') → 'Y' (NULL이므로 세 번째 인자).",
    tags: ["NULL", "NVL"],
  },
  {
    id: "c-str-func",
    category: "sql_basics",
    title: "문자 함수",
    front: "SUBSTR('DATABASE', 5, 3) 의 결과는?",
    summary:
      "SUBSTR(s,시작,길이)는 1-base. INSTR(s,문자)=위치. LENGTH=길이. REPLACE·LPAD/RPAD.",
    trap: "Oracle vs SQL Server 함수명: SUBSTR/SUBSTRING, LENGTH/LEN, INSTR/CHARINDEX.",
    example: "SUBSTR('DATABASE',5,3) → 'BAS' (5번째 B부터 3글자).",
    tags: ["문자함수"],
  },
  {
    id: "c-num-func",
    category: "sql_basics",
    title: "숫자 함수 (음수 함정)",
    front: "CEIL(-1.5) 와 FLOOR(-1.5) 는?",
    summary:
      "ROUND 반올림, TRUNC 버림, CEIL 올림(+∞ 방향), FLOOR 내림(−∞ 방향), MOD 나머지, SIGN 부호.",
    trap: "음수에서 CEIL(-1.5)=-1, FLOOR(-1.5)=-2. TRUNC(157,-1)=150(음수 자리수=정수부 절사).",
    example: "CEIL(-1.5) → -1, FLOOR(-1.5) → -2.",
    tags: ["숫자함수"],
  },
  {
    id: "c-case-decode",
    category: "sql_basics",
    title: "CASE vs DECODE",
    front: "DECODE로 범위 비교(>, <)가 될까?",
    summary:
      "CASE WHEN 조건 THEN … ELSE … END. Oracle DECODE(기준,값1,결과1,…,기본)은 = 비교 전용.",
    trap: "DECODE는 = 비교만 가능(범위 불가). CASE에 ELSE 없으면 미매칭 시 NULL 반환.",
    example:
      "DECODE(grade,'A',1,'B',2,0) ≡ CASE WHEN grade='A' THEN 1 WHEN grade='B' THEN 2 ELSE 0 END.",
    tags: ["CASE", "DECODE"],
  },
  {
    id: "c-where-op",
    category: "sql_basics",
    title: "WHERE 연산자·우선순위",
    front: "A OR B AND C 는 어떻게 묶일까?",
    summary:
      "BETWEEN a AND b(경계 포함), IN, LIKE(% 다수·_ 한 글자), IS NULL. 논리 우선순위 NOT > AND > OR.",
    trap: "A OR B AND C = A OR (B AND C). 괄호 없으면 AND가 먼저.",
    example: "3글자이고 '김'으로 시작 → LIKE '김__' (언더스코어 2개).",
    tags: ["WHERE", "우선순위"],
  },
  {
    id: "c-group-having",
    category: "sql_basics",
    title: "GROUP BY / HAVING",
    front: "집계 결과로 거르는 조건은 WHERE? HAVING?",
    summary:
      "행 필터는 WHERE(그룹 전), 그룹 집계 조건은 HAVING(그룹 후).",
    trap: "GROUP BY에 없는 일반 컬럼은 SELECT에 못 씀. WHERE에는 집계함수 불가.",
    example: "부서 평균급여 ≥ 300 → GROUP BY dept HAVING AVG(sal) >= 300.",
    tags: ["GROUP BY", "HAVING"],
  },
  {
    id: "c-count",
    category: "sql_basics",
    title: "COUNT 3형태",
    front: "COUNT(*) 와 COUNT(컬럼) 의 차이는?",
    summary:
      "COUNT(*): 전체 행(NULL 포함). COUNT(컬럼): NULL 제외. COUNT(DISTINCT 컬럼): 중복·NULL 제외.",
    trap: "COUNT(컬럼)은 그 컬럼이 NULL인 행을 세지 않는다.",
    example: "dept=[SALES,SALES,DEV,NULL] → COUNT(DISTINCT dept)=2.",
    tags: ["COUNT", "NULL"],
  },

  // ── SQL 활용 ─────────────────────────────────────────
  {
    id: "c-join",
    category: "sql_advanced",
    title: "JOIN 종류",
    front: "OUTER JOIN 결과 행수는 INNER보다 많을까 적을까?",
    summary:
      "INNER(교집합), LEFT/RIGHT/FULL OUTER(미매칭 보존→NULL), NATURAL(동명 컬럼 자동), CROSS(m×n), SELF(자기 조인·별칭 필수).",
    trap: "NATURAL JOIN에 ON/USING 병기 불가. OUTER 결과 행수 ≥ INNER.",
    example: "LEFT JOIN에서 오른쪽 미매칭 행은 NULL로 채워 1행 보존.",
    tags: ["JOIN"],
  },
  {
    id: "c-subquery",
    category: "sql_advanced",
    title: "서브쿼리 분류",
    front: "다중행 서브쿼리에 = 를 쓰면?",
    summary:
      "위치: 스칼라(SELECT)·인라인뷰(FROM)·중첩(WHERE). 반환: 단일행(=,<)·다중행(IN,ANY,ALL,EXISTS).",
    trap: "다중행에 = 쓰면 오류(→ IN). > ALL = 최댓값보다 큼, > ANY = 최솟값보다 큼.",
    example: "sal > ALL(SELECT sal …) → 서브쿼리 최댓값보다 커야 참.",
    tags: ["서브쿼리", "ANY", "ALL"],
  },
  {
    id: "c-setop",
    category: "sql_advanced",
    title: "집합 연산자",
    front: "{A,B} UNION {B,C} 의 행 수는?",
    summary:
      "UNION(합집합·중복제거·정렬수반), UNION ALL(중복유지), INTERSECT(교집합), MINUS/EXCEPT(차집합).",
    trap: "컬럼 개수·타입 호환 필수. 결과 컬럼명은 첫 SELECT 기준. UNION은 정렬 비용 발생.",
    example: "{A,B} UNION {B,C} → 3행(B는 하나). UNION ALL → 4행.",
    tags: ["집합연산", "UNION"],
  },
  {
    id: "c-grouping",
    category: "sql_advanced",
    title: "ROLLUP / CUBE",
    front: "부서 2개에 ROLLUP(dept) 이면 몇 행?",
    summary:
      "ROLLUP(a,b): 계층 소계 (a,b)→(a)→(). CUBE(a,b): 모든 조합 소계. GROUPING()으로 소계행 판별(1/0).",
    trap: "ROLLUP은 일방향, CUBE는 전방향. 소계 행의 그룹 컬럼 값은 NULL.",
    example: "부서 2개 + ROLLUP(dept) → 상세 2 + 총계 1 = 3행.",
    tags: ["ROLLUP", "CUBE"],
  },
  {
    id: "c-window",
    category: "sql_advanced",
    title: "윈도우 함수 (순위)",
    front: "값 100,100,90 일 때 RANK와 DENSE_RANK는?",
    summary:
      "RANK(1,2,2,4 건너뜀), DENSE_RANK(1,2,2,3 안 건너뜀), ROW_NUMBER(1,2,3,4 유일). LAG/LEAD는 이전/다음 행.",
    trap: "윈도우 함수는 행을 줄이지 않는다(PARTITION BY ≠ GROUP BY).",
    example: "100,100,90 → RANK 1,1,3 / DENSE_RANK 1,1,2.",
    tags: ["윈도우함수", "RANK"],
  },
  {
    id: "c-rownum",
    category: "sql_advanced",
    title: "ROWNUM / Top-N",
    front: "WHERE ROWNUM<=3 ORDER BY sal DESC 는 왜 오답?",
    summary:
      "Oracle ROWNUM은 정렬 전에 매겨진다. 상위 N은 인라인뷰로 먼저 정렬한 뒤 바깥에서 ROWNUM 적용.",
    trap: "WHERE ROWNUM<=3 ORDER BY …는 정렬 전에 잘림 → 오답. ROWNUM>1 조건은 항상 거짓(아무 행도 안 나옴).",
    example:
      "상위 3명 → SELECT * FROM (SELECT … ORDER BY sal DESC) WHERE ROWNUM<=3.",
    tags: ["ROWNUM", "TopN"],
  },
  {
    id: "c-hierarchy",
    category: "sql_advanced",
    title: "계층형 질의",
    front: "CONNECT BY에서 전개 방향을 결정하는 것은?",
    summary:
      "START WITH(루트) + CONNECT BY PRIOR(부모-자식 전개). LEVEL(깊이,루트=1), CONNECT_BY_ISLEAF(잎=1).",
    trap: "PRIOR의 위치가 정방향/역방향을 결정. START WITH는 루트 지정일 뿐 전개규칙이 아님.",
    example: "CONNECT BY PRIOR empno = mgr → 상위(부모)에서 하위로 전개.",
    tags: ["계층질의", "CONNECT BY"],
  },

  // ── 관리 구문 ────────────────────────────────────────
  {
    id: "c-dml-merge",
    category: "sql_management",
    title: "DELETE vs TRUNCATE vs DROP",
    front: "TRUNCATE는 ROLLBACK으로 되돌릴 수 있을까?",
    summary:
      "DELETE(DML·조건 삭제·롤백 가능), TRUNCATE(DDL·전체 삭제·자동커밋·공간 반납), DROP(테이블 구조까지 삭제).",
    trap: "TRUNCATE는 DDL이라 ROLLBACK 불가. DDL은 실행 시 자동 커밋.",
    example: "MERGE … WHEN MATCHED THEN UPDATE / WHEN NOT MATCHED THEN INSERT.",
    tags: ["DML", "TRUNCATE", "MERGE"],
  },
  {
    id: "c-tcl",
    category: "sql_management",
    title: "TCL (트랜잭션 제어)",
    front: "SAVEPOINT는 무엇에 쓰나?",
    summary:
      "COMMIT(확정), ROLLBACK(취소), SAVEPOINT(부분 롤백 지점). ROLLBACK TO savepoint로 일부만 되돌림.",
    trap: "DDL(CREATE/ALTER/TRUNCATE 등)은 자동 커밋되어 이전 트랜잭션도 확정된다.",
    example: "SAVEPOINT s1; … ROLLBACK TO s1; → s1 이후 변경만 취소.",
    tags: ["TCL", "COMMIT", "SAVEPOINT"],
  },
  {
    id: "c-constraint",
    category: "sql_management",
    title: "제약조건 & 참조 무결성",
    front: "UNIQUE 컬럼에 NULL은 여러 개 들어갈 수 있을까?",
    summary:
      "PK(UNIQUE+NOT NULL, 테이블당 1개), UNIQUE(NULL 허용), CHECK, NOT NULL, FK(참조).",
    trap:
      "UNIQUE는 NULL 다수 허용. FK 참조 옵션 ON DELETE CASCADE(연쇄 삭제)/SET NULL/RESTRICT.",
    example: "복합키는 여러 컬럼으로 PK 구성 가능하나, PK 자체는 테이블당 하나.",
    tags: ["제약조건", "PK", "FK"],
  },
  {
    id: "c-dcl",
    category: "sql_management",
    title: "DCL (권한)",
    front: "WITH GRANT OPTION 을 주면?",
    summary:
      "GRANT(권한 부여), REVOKE(회수), ROLE(권한 묶음). WITH GRANT OPTION은 재부여 권한.",
    trap: "WITH GRANT OPTION으로 받은 사용자는 그 권한을 다른 사용자에게 다시 부여할 수 있다.",
    example: "GRANT SELECT ON emp TO hr WITH GRANT OPTION;",
    tags: ["DCL", "GRANT"],
  },

  // ── 데이터 모델링 ───────────────────────────────────
  {
    id: "c-schema",
    category: "modeling_basics",
    title: "3층 스키마 · 데이터 독립성",
    front: "논리적 독립성과 물리적 독립성의 경계는?",
    summary:
      "외부(뷰·다수)/개념(통합 논리)/내부(물리) 3층. 논리적 독립성=개념↔외부, 물리적 독립성=내부↔개념.",
    trap: "물리 저장구조를 바꿔도 개념 스키마가 안 바뀌면 물리적 독립성 확보.",
    example: "인덱스 추가(내부)로 뷰(외부)가 영향 없음 → 물리적 독립성.",
    tags: ["3층스키마", "독립성"],
  },
  {
    id: "c-identifier",
    category: "modeling_basics",
    title: "주식별자 4대 특성",
    front: "주식별자가 갖춰야 할 네 가지는?",
    summary:
      "유일성·최소성·불변성·존재성. 식별자 분류: 주/보조, 내부/외부, 단일/복합, 본질/인조(대리).",
    trap: "주식별자 값은 자주 변하면 안 됨(불변성). NULL이면 안 됨(존재성).",
    example: "회원번호=인조(대리)식별자, 주민번호=본질식별자.",
    tags: ["식별자", "주식별자"],
  },
  {
    id: "c-normalization",
    category: "modeling_basics",
    title: "정규화 (1NF~BCNF)",
    front: "이행함수종속을 제거하는 정규형은?",
    summary:
      "1NF(원자성)·2NF(부분함수종속 제거)·3NF(이행함수종속 제거)·BCNF(모든 결정자가 후보키).",
    trap: "정규화는 이상현상(삽입/갱신/삭제)을 없애지만, 조인 증가로 조회성능이 떨어질 수 있다.",
    example: "A→B, B→C(이행) 종속을 분리하면 3NF.",
    tags: ["정규화", "함수종속", "BCNF"],
  },
  {
    id: "c-denorm",
    category: "modeling_performance",
    title: "반정규화 & 식별자 관계",
    front: "식별관계(실선)와 비식별관계(점선)의 차이는?",
    summary:
      "반정규화: 조회성능↑ 대신 중복·정합성 부담↑. 식별관계=부모PK가 자식PK로(실선·강함), 비식별관계=부모PK가 자식 일반속성으로(점선·약함).",
    trap: "반정규화는 성능을 위해 의도적으로 중복을 허용 — 정규화의 반대 방향.",
    example: "주문-주문상세: 주문번호가 상세의 PK 일부 → 식별관계.",
    tags: ["반정규화", "식별관계"],
  },
  {
    id: "c-acid",
    category: "modeling_performance",
    title: "트랜잭션 ACID",
    front: "'중간 결과가 다른 트랜잭션에 안 보인다'는 어느 특성?",
    summary:
      "원자성(All or Nothing)·일관성(무결성 유지)·고립성(중간결과 간섭 불가)·지속성(성공 시 영구 저장).",
    trap: "고립성(Isolation)이 중간 결과 간섭을 막는 특성. 지속성은 커밋 후 영구성.",
    example: "이체 중 출금만 되고 입금 실패 → 원자성으로 전체 취소.",
    tags: ["트랜잭션", "ACID"],
  },
];

/** 개념 카테고리 → 표시 그룹(카드 필터 칩용) */
export const CONCEPT_GROUPS: { key: "all" | "sql" | "modeling"; label: string }[] =
  [
    { key: "all", label: "전체" },
    { key: "sql", label: "SQL" },
    { key: "modeling", label: "데이터모델링" },
  ];
