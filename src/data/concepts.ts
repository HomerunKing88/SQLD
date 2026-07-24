// 빈출 개념 카드(플래시카드) — 이동 중 한 손 반복 암기용.
// docs/GICHUL_CONCEPTS.md 및 SQLD 공개 출제기준(과목1 데이터모델링 / 과목2 SQL)에
// 근거한 오리지널 요약 카드. 문제 풀이(무거움)와 달리 개념·함정·예제를 빠르게
// 뒤집어 보며 반복 각인한다. 점수/정답률 통계에는 영향 없음(순수 암기 트랙).
import type { Concept } from "@/lib/types";

export const CONCEPTS: Concept[] = [
  // ══════════════════════════════════════════════════════
  // 과목 1 · 데이터 모델링의 이해 (modeling_basics)
  // ══════════════════════════════════════════════════════
  {
    id: "c-modeling-perspective",
    category: "modeling_basics",
    title: "데이터 모델링 3가지 관점",
    front: "데이터 모델링을 바라보는 세 관점은?",
    summary:
      "① 데이터(무엇) ② 프로세스(어떻게) ③ 상관(데이터와 프로세스의 관계). 데이터 모델링은 '데이터' 관점에 집중.",
    trap: "모델링의 3대 개념은 '업무 파악·데이터 관점·구조화'가 아니라 관점 3종.",
    example: "정보시스템 구축 = 데이터 + 프로세스 + 그 상관관계.",
    tags: ["모델링", "관점"],
  },
  {
    id: "c-modeling-stage",
    category: "modeling_basics",
    title: "데이터 모델링 3단계",
    front: "개념적·논리적·물리적 모델링의 순서와 특징은?",
    summary:
      "개념적(전사·추상·핵심엔터티·업무중심) → 논리적(정규화·상세·재사용성↑·DBMS 독립) → 물리적(테이블·인덱스·성능·DBMS 종속).",
    trap: "정규화는 '논리적' 단계. 물리적 단계에서 성능·저장을 고려.",
    example: "논리 모델은 특정 DBMS에 독립적이라 재사용성이 높다.",
    tags: ["모델링", "단계"],
  },
  {
    id: "c-modeling-pitfall",
    category: "modeling_basics",
    title: "데이터 모델링 유의점",
    front: "데이터 모델링에서 피해야 할 세 가지는?",
    summary:
      "중복(같은 데이터 여러 곳)·비유연성(사소한 변화에 큰 영향)·비일관성(모순된 값 저장).",
    trap: "비유연성은 '데이터 정의를 프로세스와 분리'해 완화. 데이터와 애플리케이션의 결합도를 낮춘다.",
    example: "동일 정보를 두 테이블에 저장 → 갱신 누락 시 비일관성.",
    tags: ["모델링", "유의점"],
  },
  {
    id: "c-schema",
    category: "modeling_basics",
    title: "3층 스키마 · 데이터 독립성",
    front: "논리적 독립성과 물리적 독립성의 경계는?",
    summary:
      "외부(뷰·다수)/개념(통합 논리)/내부(물리) 3층. 논리적 독립성=개념↔외부, 물리적 독립성=내부↔개념.",
    trap: "인덱스 추가(내부) 후에도 개념 스키마가 안 바뀌면 물리적 독립성 확보.",
    example: "저장구조 변경이 응용 프로그램(외부)에 영향 없음 → 물리적 독립성.",
    tags: ["3층스키마", "독립성"],
  },
  {
    id: "c-entity-def",
    category: "modeling_basics",
    title: "엔터티의 특징",
    front: "무언가가 엔터티가 되려면 갖춰야 할 조건은?",
    summary:
      "업무에서 필요·유일한 식별자·2개 이상의 인스턴스 집합·반드시 속성 보유·다른 엔터티와 관계.",
    trap: "인스턴스가 하나뿐이면 엔터티로 부적절. 속성이 하나도 없어도 안 됨.",
    example: "'사원'은 여러 명(인스턴스)이 있고 사번(식별자)·이름(속성)을 가짐.",
    tags: ["엔터티"],
  },
  {
    id: "c-entity-class",
    category: "modeling_basics",
    title: "엔터티 분류",
    front: "유형·개념·사건 / 기본·중심·행위 엔터티?",
    summary:
      "유무형: 유형(물리적 존재)·개념(개념적)·사건(발생·행위 결과). 발생시점: 기본(독립·부모)·중심(기본에서 발생)·행위(둘 이상 관계로 발생).",
    trap: "행위 엔터티는 다른 엔터티 간 행위로 생성(예: 주문, 계약).",
    example: "사원=기본, 주문=중심, 주문상세=행위 엔터티.",
    tags: ["엔터티", "분류"],
  },
  {
    id: "c-attribute-class",
    category: "modeling_basics",
    title: "속성 분류 & 도메인",
    front: "기본·설계·파생 속성의 차이는?",
    summary:
      "기본(업무에서 추출), 설계(설계 과정에서 생성, 예: 코드), 파생(다른 속성에서 계산, 예: 합계). 도메인=속성이 가질 수 있는 값의 범위.",
    trap: "파생속성은 계산값이라 정합성 관리 필요 → 되도록 최소화.",
    example: "주문금액 합계 = 파생속성(수량×단가에서 계산).",
    tags: ["속성", "도메인", "파생"],
  },
  {
    id: "c-relationship",
    category: "modeling_basics",
    title: "관계의 분류",
    front: "존재 관계와 행위 관계의 차이는?",
    summary:
      "존재에 의한 관계(상태로 연결, 예: 소속) vs 행위에 의한 관계(행위로 연결, 예: 주문). 관계는 페어링으로 표현.",
    trap: "관계 표기 요소: 관계명·차수(1:1,1:M,M:N)·선택성(필수/선택).",
    example: "사원이 부서에 '소속'=존재관계, 고객이 '주문'=행위관계.",
    tags: ["관계"],
  },
  {
    id: "c-cardinality",
    category: "modeling_basics",
    title: "관계 차수 · 선택성",
    front: "관계의 차수(cardinality)와 선택성(optionality)은?",
    summary:
      "차수: 1:1, 1:M, M:N. 선택성: 필수(mandatory, 반드시 참여)·선택(optional, 참여 안 할 수도).",
    trap: "M:N 관계는 논리적으로 가능하나 물리 설계에서 보통 교차(연결) 엔터티로 해소.",
    example: "회원-주문 = 1:M(회원 1명이 주문 여러 건).",
    tags: ["관계", "차수", "선택성"],
  },
  {
    id: "c-erd-notation",
    category: "modeling_basics",
    title: "ERD 표기법",
    front: "IE 표기법에서 '까마귀발'은 무엇을 뜻할까?",
    summary:
      "IE(까마귀발): 선 끝 삼발이=多(N). Barker(원+선): 점선=선택, 실선=필수. 관계 차수·선택성을 시각화.",
    trap: "까마귀발이 붙은 쪽이 M(다)측. 원(○)은 선택(optional)을 의미.",
    example: "부서 ─< 사원: 사원 쪽 까마귀발 → 부서 1 : 사원 多.",
    tags: ["ERD", "표기법"],
  },
  {
    id: "c-identifier",
    category: "modeling_basics",
    title: "주식별자 4대 특성",
    front: "주식별자가 갖춰야 할 네 가지는?",
    summary:
      "유일성·최소성·불변성·존재성. 분류: 주/보조, 내부/외부, 단일/복합, 본질/인조.",
    trap: "주식별자 값은 자주 바뀌면 안 됨(불변성), NULL 불가(존재성).",
    example: "회원번호=인조(대리)식별자, 주민번호=본질식별자.",
    tags: ["식별자", "주식별자"],
  },
  {
    id: "c-identifier-rel",
    category: "modeling_basics",
    title: "식별관계 vs 비식별관계",
    front: "실선(식별)과 점선(비식별) 관계의 차이는?",
    summary:
      "식별관계=부모PK가 자식의 PK로 상속(실선·강함). 비식별관계=부모PK가 자식의 일반속성(FK)으로 상속(점선·약함).",
    trap: "식별관계는 자식이 부모 없이 존재 불가. 과도한 식별관계는 PK 개수를 늘려 복잡도↑.",
    example: "주문-주문상세: 주문번호가 상세의 PK 일부 → 식별관계.",
    tags: ["식별관계", "관계"],
  },
  {
    id: "c-func-dependency",
    category: "modeling_basics",
    title: "함수적 종속성",
    front: "완전·부분·이행 함수 종속의 차이는?",
    summary:
      "X→Y(X가 Y 결정). 부분종속=복합키 일부에만 종속(2NF 위반). 이행종속=X→Y→Z(3NF 위반).",
    trap: "정규화는 이 종속 관계를 근거로 테이블을 분해한다.",
    example: "(학번,과목)→성적은 완전종속, (학번,과목)→학생이름은 부분종속.",
    tags: ["함수종속", "정규화"],
  },
  {
    id: "c-anomaly",
    category: "modeling_basics",
    title: "이상현상 (Anomaly)",
    front: "정규화로 없애려는 세 가지 이상현상은?",
    summary:
      "삽입 이상(불필요 데이터 없인 삽입 불가)·갱신 이상(중복 일부만 갱신→불일치)·삭제 이상(원치 않는 데이터까지 삭제).",
    trap: "이상현상의 근본 원인은 '하나의 테이블에 여러 주제'가 섞인 것 → 정규화로 분리.",
    example: "수강 취소 시 학생 정보까지 사라짐 → 삭제 이상.",
    tags: ["이상현상", "정규화"],
  },
  {
    id: "c-normalization",
    category: "modeling_basics",
    title: "정규화 (1NF~BCNF)",
    front: "이행함수종속을 제거하는 정규형은?",
    summary:
      "1NF(원자값)·2NF(부분종속 제거)·3NF(이행종속 제거)·BCNF(모든 결정자가 후보키).",
    trap: "정규화는 이상현상을 없애지만, 조인 증가로 조회 성능이 떨어질 수 있다.",
    example: "A→B, B→C(이행) 종속을 분리하면 3NF.",
    tags: ["정규화", "BCNF"],
  },
  {
    id: "c-supertype-subtype",
    category: "modeling_basics",
    title: "슈퍼타입 / 서브타입",
    front: "서브타입을 물리 테이블로 바꾸는 3가지 방식은?",
    summary:
      "① All in One(Single·하나로 통합) ② One To One(서브타입별 개별 테이블) ③ Plus(슈퍼+서브 각각).",
    trap:
      "데이터 적고 통합처리 多 → Single. 데이터 많고 개별처리 多 → OneToOne. 중간 → Plus.",
    example: "개인/법인 회원 → 조회가 대부분 통합이면 All in One이 유리.",
    tags: ["슈퍼타입", "서브타입"],
  },
  {
    id: "c-null-modeling",
    category: "modeling_basics",
    title: "NULL 속성 & 데이터 무결성",
    front: "NULL을 함부로 허용하면 생기는 문제는?",
    summary:
      "NULL은 계산·비교에서 예외 처리 필요. 무결성: 개체(PK)·참조(FK)·도메인(값 범위)·사용자 정의 무결성.",
    trap: "PK는 개체 무결성으로 NULL 불가. FK는 참조 무결성(부모에 있는 값만).",
    example: "필수값을 NULL 허용하면 집계·조인에서 누락 위험.",
    tags: ["NULL", "무결성"],
  },

  // ══════════════════════════════════════════════════════
  // 과목 1 · 데이터 모델과 성능 (modeling_performance)
  // ══════════════════════════════════════════════════════
  {
    id: "c-perf-modeling",
    category: "modeling_performance",
    title: "성능 데이터 모델링",
    front: "성능 데이터 모델링을 언제 하는 게 가장 효과적일까?",
    summary:
      "DB 성능 향상을 위해 설계 단계부터 정규화·반정규화·테이블 분할·PK/인덱스를 조정하는 활동. 초기(분석·설계)에 할수록 비용이 적다.",
    trap: "성능 문제를 구축 후 발견하면 개선 비용이 급증 → 사전 설계가 핵심.",
    example: "대량 조회가 예상되는 테이블은 설계 시점에 분할·인덱스 고려.",
    tags: ["성능모델링"],
  },
  {
    id: "c-normalization-perf",
    category: "modeling_performance",
    title: "정규화와 조회 성능",
    front: "정규화하면 성능은 항상 나빠질까?",
    summary:
      "정규화는 중복을 줄여 입력/수정/삭제 성능은 향상. 조회는 조인 증가로 느려질 수 있으나, 데이터가 작아져 오히려 빨라지기도 함.",
    trap: "'정규화=무조건 조회 저하'는 오답. 상황에 따라 조회도 개선된다.",
    example: "한 테이블이 너무 넓으면 정규화로 나눠 I/O가 줄 수 있다.",
    tags: ["정규화", "성능"],
  },
  {
    id: "c-denorm",
    category: "modeling_performance",
    title: "반정규화",
    front: "반정규화는 무엇을 얻고 무엇을 잃을까?",
    summary:
      "조회 성능을 위해 의도적으로 중복을 허용. 대가로 정합성 관리 부담·저장공간↑. 데이터 무결성 저하 위험.",
    trap: "반정규화는 성능이 확실히 문제될 때 마지막에 적용. 무결성은 애플리케이션/트리거로 보완.",
    example: "주문에 고객명을 중복 저장 → 조인 없이 조회, 대신 고객명 변경 시 갱신 부담.",
    tags: ["반정규화", "성능"],
  },
  {
    id: "c-denorm-tech",
    category: "modeling_performance",
    title: "반정규화 기법",
    front: "반정규화의 대상 3종류는?",
    summary:
      "① 테이블(병합·분할·추가) ② 컬럼(중복·파생컬럼·이력) ③ 관계(중복 관계 추가). 통계·요약 테이블 추가도 포함.",
    trap: "수직분할=자주 쓰는 컬럼만 분리, 수평분할=행을 파티션으로 분리.",
    example: "월별 요약 테이블을 따로 두어 집계 조회를 가속.",
    tags: ["반정규화", "기법"],
  },
  {
    id: "c-partition",
    category: "modeling_performance",
    title: "대량 데이터 분할 · 파티셔닝",
    front: "Range·List·Hash 파티셔닝의 기준은?",
    summary:
      "파티셔닝: Range(범위, 예: 날짜)·List(목록값)·Hash(해시 분산)·Composite(결합). 대량 테이블을 물리적으로 나눠 성능·관리성↑.",
    trap: "이력·날짜성 데이터는 Range 파티셔닝이 흔함. 파티션 키로 조회하면 프루닝으로 빨라짐.",
    example: "주문 테이블을 주문일자 기준 Range 파티션 → 특정 월만 스캔.",
    tags: ["파티셔닝", "대량데이터"],
  },
  {
    id: "c-index-perf",
    category: "modeling_performance",
    title: "인덱스와 성능",
    front: "인덱스를 많이 만들면 무조건 좋을까?",
    summary:
      "인덱스(주로 B-tree)는 조회를 빠르게 하지만, INSERT/UPDATE/DELETE 시 인덱스도 갱신되어 DML 성능은 저하.",
    trap: "카디널리티 낮은 컬럼(성별 등)은 인덱스 효율 낮음. 인덱스는 필요한 만큼만.",
    example: "자주 조회하는 조건 컬럼에 인덱스 → 조회 빠름, 잦은 갱신 테이블엔 신중.",
    tags: ["인덱스", "성능"],
  },
  {
    id: "c-pk-order",
    category: "modeling_performance",
    title: "PK 컬럼 순서와 성능",
    front: "복합 PK의 컬럼 순서가 왜 성능에 영향을 줄까?",
    summary:
      "PK는 자동으로 인덱스를 만든다. 인덱스는 선행 컬럼부터 정렬되므로, WHERE에서 '='로 자주 쓰는 컬럼을 앞에 두어야 유리.",
    trap: "범위(BETWEEN) 조건 컬럼을 앞에 두면 뒤 컬럼 인덱스 활용이 떨어질 수 있다.",
    example: "WHERE 부서=? AND 입사일 BETWEEN … → PK 순서 (부서, 입사일).",
    tags: ["PK", "인덱스", "성능"],
  },
  {
    id: "c-distributed-db",
    category: "modeling_performance",
    title: "분산 데이터베이스",
    front: "분산 DB의 대표적 장단점은?",
    summary:
      "여러 물리적 위치에 DB 분산. 장점: 지역 자치성·가용성·확장성. 단점: 설계 복잡·투명성 관리·무결성 통제 어려움.",
    trap: "투명성 종류: 분할·위치·중복·장애·병행 투명성. 사용자는 하나의 DB처럼 인식.",
    example: "지역별 서버에 분산 저장하되 사용자에겐 단일 DB로 보이게(위치 투명성).",
    tags: ["분산DB"],
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

  // ══════════════════════════════════════════════════════
  // 과목 2 · SQL 기본 (sql_basics)
  // ══════════════════════════════════════════════════════
  {
    id: "c-sql-types",
    category: "sql_basics",
    title: "SQL 문장의 종류",
    front: "TRUNCATE는 DDL일까 DML일까?",
    summary:
      "DDL(CREATE/ALTER/DROP/RENAME/TRUNCATE), DML(SELECT/INSERT/UPDATE/DELETE), DCL(GRANT/REVOKE), TCL(COMMIT/ROLLBACK/SAVEPOINT).",
    trap: "TRUNCATE는 DDL(자동 커밋). DELETE는 DML(롤백 가능). SELECT는 DML로 분류.",
    example: "GRANT/REVOKE=DCL, COMMIT=TCL.",
    tags: ["SQL종류", "DDL", "DML"],
  },
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
      "SELECT sal*12 AS annual FROM emp WHERE annual>3000 → 오류. WHERE sal*12>3000 로.",
    tags: ["실행순서", "ALIAS"],
  },
  {
    id: "c-select-distinct",
    category: "sql_basics",
    title: "SELECT · DISTINCT · 별칭",
    front: "DISTINCT는 어떤 기준으로 중복을 제거할까?",
    summary:
      "DISTINCT는 SELECT 컬럼 '조합' 전체가 같은 행을 하나로. 별칭(AS)은 컬럼명 대체(공백·특수문자는 \"\").",
    trap: "DISTINCT A, B는 A만이 아니라 (A,B) 쌍의 중복을 제거.",
    example: "SELECT DISTINCT dept, job → (dept,job) 조합별 1행.",
    tags: ["SELECT", "DISTINCT"],
  },
  {
    id: "c-concat",
    category: "sql_basics",
    title: "연산자 · 합성(연결)",
    front: "문자열을 잇는 Oracle 연산자는?",
    summary:
      "산술(+,-,*,/), 합성(연결) Oracle: ||, SQL Server: +, 표준: CONCAT. 연결 시 문자 취급.",
    trap: "NULL을 || 로 연결하면 Oracle은 무시(빈 문자처럼) — 산술 NULL과 다름.",
    example: "'A' || NULL || 'B' → 'AB' (Oracle).",
    tags: ["연산자", "연결"],
  },
  {
    id: "c-where-op",
    category: "sql_basics",
    title: "WHERE 연산자·우선순위",
    front: "A OR B AND C 는 어떻게 묶일까?",
    summary:
      "비교·BETWEEN·IN·LIKE·IS NULL. 논리 우선순위 NOT > AND > OR. 괄호로 명시 권장.",
    trap: "A OR B AND C = A OR (B AND C). AND가 OR보다 먼저.",
    example: "3글자이고 '김'으로 시작 → LIKE '김__' (언더스코어 2개).",
    tags: ["WHERE", "우선순위"],
  },
  {
    id: "c-between-in-like",
    category: "sql_basics",
    title: "BETWEEN · IN · LIKE",
    front: "LIKE의 % 와 _ 의 차이는? 실제 %를 찾으려면?",
    summary:
      "BETWEEN a AND b(경계 포함). IN(목록). LIKE: %(0글자 이상), _(정확히 한 글자). ESCAPE로 와일드카드 자체 검색.",
    trap: "리터럴 % 검색 → LIKE '%\\%%' ESCAPE '\\'. IN에 NULL이 섞이면 NOT IN이 오작동.",
    example: "LIKE 'A_%' → A로 시작하고 최소 2글자.",
    tags: ["LIKE", "BETWEEN", "IN"],
  },
  {
    id: "c-order-by",
    category: "sql_basics",
    title: "ORDER BY",
    front: "Oracle에서 ASC 정렬 시 NULL은 앞? 뒤?",
    summary:
      "ORDER BY는 맨 마지막 실행. ASC(기본)/DESC. 컬럼명·별칭·컬럼번호(1,2…) 사용 가능. Oracle: ASC→NULLS LAST, DESC→NULLS FIRST(기본).",
    trap: "ORDER BY 2 = SELECT의 두 번째 컬럼 기준 정렬. 별칭은 ORDER BY에서 사용 가능.",
    example: "ORDER BY sal DESC NULLS LAST → 급여 큰 순, NULL은 맨 뒤.",
    tags: ["ORDER BY", "정렬", "NULL"],
  },
  {
    id: "c-str-func",
    category: "sql_basics",
    title: "문자 함수",
    front: "SUBSTR('DATABASE', 5, 3) 의 결과는?",
    summary:
      "SUBSTR(s,시작,길이) 1-base. INSTR(s,문자)=위치. LENGTH=길이. LPAD/RPAD, TRIM, REPLACE.",
    trap: "Oracle vs SQL Server: SUBSTR/SUBSTRING, LENGTH/LEN, INSTR/CHARINDEX.",
    example: "SUBSTR('DATABASE',5,3) → 'BAS'.",
    tags: ["문자함수"],
  },
  {
    id: "c-num-func",
    category: "sql_basics",
    title: "숫자 함수 (음수 함정)",
    front: "CEIL(-1.5) 와 FLOOR(-1.5) 는?",
    summary:
      "ROUND 반올림, TRUNC 버림, CEIL 올림(+∞), FLOOR 내림(−∞), MOD 나머지, SIGN 부호.",
    trap: "CEIL(-1.5)=-1, FLOOR(-1.5)=-2. TRUNC(157,-1)=150(음수 자리수=정수부 절사). MOD(a,0)=a.",
    example: "CEIL(-1.5) → -1, FLOOR(-1.5) → -2.",
    tags: ["숫자함수"],
  },
  {
    id: "c-date-func",
    category: "sql_basics",
    title: "날짜 함수",
    front: "ADD_MONTHS로 1월 31일에 +1개월 하면?",
    summary:
      "SYSDATE(현재), ADD_MONTHS(월 가감), MONTHS_BETWEEN(월 차·소수 가능), LAST_DAY(그 달 말일), 날짜±숫자=일 단위.",
    trap: "ADD_MONTHS는 말일 보정 → '2026-01-31' +1개월 = '2026-02-28'(비윤년 말일).",
    example: "SYSDATE + 7 → 7일 뒤. MONTHS_BETWEEN은 앞-뒤 순서.",
    tags: ["날짜함수"],
  },
  {
    id: "c-convert-func",
    category: "sql_basics",
    title: "변환 함수 (암시적/명시적)",
    front: "명시적 형변환과 암시적 형변환의 차이는?",
    summary:
      "명시적: TO_CHAR/TO_NUMBER/TO_DATE로 직접 변환. 암시적: DBMS가 자동 변환(성능·인덱스 저하 위험).",
    trap: "인덱스 컬럼에 암시적 형변환이 걸리면 인덱스를 못 타 성능 저하.",
    example: "TO_CHAR(SYSDATE,'YYYY-MM-DD'). WHERE 문자컬럼=숫자 → 암시적 변환 발생.",
    tags: ["변환함수", "형변환"],
  },
  {
    id: "c-null-arith",
    category: "sql_basics",
    title: "NULL 연산·비교",
    front: "100 + NULL 의 결과는?",
    summary:
      "NULL은 '알 수 없음'(0·공백 아님). 행 내 산술에 NULL이 끼면 결과 NULL. 집계 SUM/AVG/COUNT(컬럼)는 NULL 제외.",
    trap: "NULL 비교는 =,!= 불가 → IS NULL / IS NOT NULL. COUNT(*)만 전체 행.",
    example: "comm에 NULL 3개 포함 10행 → AVG(comm) 분모는 7.",
    tags: ["NULL", "집계"],
  },
  {
    id: "c-null-func",
    category: "sql_basics",
    title: "NULL 처리 함수",
    front: "NVL2(NULL, 'X', 'Y') 의 값은?",
    summary:
      "NVL(a,b): a NULL이면 b. NVL2(a,b,c): a NOT NULL이면 b, NULL이면 c. NULLIF(a,b): a=b면 NULL. COALESCE: 첫 NOT NULL.",
    trap: "NVL2는 인자 순서 주의(NOT NULL일 때가 먼저). SQL Server는 ISNULL.",
    example: "NVL2(NULL,'X','Y') → 'Y'.",
    tags: ["NULL", "NVL"],
  },
  {
    id: "c-case-decode",
    category: "sql_basics",
    title: "CASE vs DECODE",
    front: "DECODE로 범위 비교(>, <)가 될까?",
    summary:
      "CASE WHEN 조건 THEN … ELSE … END. Oracle DECODE(기준,값1,결과1,…,기본)은 = 비교 전용.",
    trap: "DECODE는 = 비교만(범위 불가). CASE에 ELSE 없으면 미매칭 시 NULL.",
    example:
      "DECODE(g,'A',1,'B',2,0) ≡ CASE WHEN g='A' THEN 1 WHEN g='B' THEN 2 ELSE 0 END.",
    tags: ["CASE", "DECODE"],
  },
  {
    id: "c-agg-func",
    category: "sql_basics",
    title: "집계 함수",
    front: "집계 함수는 NULL을 어떻게 다룰까?",
    summary:
      "SUM/AVG/MAX/MIN/COUNT/STDDEV/VARIANCE. MAX/MIN은 문자·날짜도 가능. 모두 NULL은 연산에서 제외.",
    trap: "WHERE에는 집계함수 불가(→ HAVING). AVG는 NULL을 뺀 개수로 나눔.",
    example: "SUM(sal) 은 sal이 NULL인 행을 빼고 합산.",
    tags: ["집계함수"],
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
  {
    id: "c-group-having",
    category: "sql_basics",
    title: "GROUP BY / HAVING",
    front: "집계 결과로 거르는 조건은 WHERE? HAVING?",
    summary: "행 필터는 WHERE(그룹 전), 그룹 집계 조건은 HAVING(그룹 후).",
    trap: "GROUP BY에 없는 일반 컬럼은 SELECT에 못 씀. WHERE에 집계함수 불가.",
    example: "부서 평균급여 ≥ 300 → GROUP BY dept HAVING AVG(sal) >= 300.",
    tags: ["GROUP BY", "HAVING"],
  },
  {
    id: "c-join",
    category: "sql_basics",
    title: "JOIN 종류",
    front: "OUTER JOIN 결과 행수는 INNER보다 많을까 적을까?",
    summary:
      "INNER(교집합), LEFT/RIGHT/FULL OUTER(미매칭 보존→NULL), NATURAL(동명 컬럼 자동), CROSS(m×n), SELF(자기 조인).",
    trap: "NATURAL JOIN에 ON/USING 병기 불가. OUTER 결과 행수 ≥ INNER.",
    example: "LEFT JOIN에서 오른쪽 미매칭 행은 NULL로 1행 보존.",
    tags: ["JOIN"],
  },
  {
    id: "c-join-equi",
    category: "sql_basics",
    title: "EQUI vs NON-EQUI 조인",
    front: "등가(EQUI) 조인과 비등가(NON-EQUI) 조인의 차이는?",
    summary:
      "EQUI: = 로 연결(대부분의 조인). NON-EQUI: BETWEEN·>·< 등 범위로 연결(등급표 매핑 등).",
    trap: "NON-EQUI 조인은 = 이 성립하지 않는 경우에 범위 조건으로 매칭.",
    example: "급여를 급여등급표의 LOW~HIGH 사이로 매핑 → BETWEEN 사용 NON-EQUI.",
    tags: ["JOIN", "EQUI"],
  },
  {
    id: "c-natural-using",
    category: "sql_basics",
    title: "NATURAL / USING / ON",
    front: "NATURAL JOIN에 컬럼 접두사(별칭)를 붙이면?",
    summary:
      "ON(임의 조건 명시), USING(동일 이름 컬럼 지정), NATURAL(동일 이름 컬럼 자동 전체).",
    trap:
      "NATURAL·USING으로 조인된 컬럼엔 테이블 접두사(alias.col)를 붙이면 오류. ON은 붙여야 함.",
    example: "A JOIN B USING(dept) → SELECT dept (접두사 없이).",
    tags: ["JOIN", "NATURAL", "USING"],
  },

  // ══════════════════════════════════════════════════════
  // 과목 2 · SQL 활용 (sql_advanced)
  // ══════════════════════════════════════════════════════
  {
    id: "c-subquery",
    category: "sql_advanced",
    title: "서브쿼리 분류",
    front: "다중행 서브쿼리에 = 를 쓰면?",
    summary:
      "위치: 스칼라(SELECT)·인라인뷰(FROM)·중첩(WHERE). 반환: 단일행(=,<)·다중행(IN,ANY,ALL,EXISTS).",
    trap: "다중행에 = 쓰면 오류(→ IN). > ALL=최댓값보다 큼, > ANY=최솟값보다 큼.",
    example: "sal > ALL(SELECT sal …) → 서브쿼리 최댓값보다 커야 참.",
    tags: ["서브쿼리", "ANY", "ALL"],
  },
  {
    id: "c-scalar-subquery",
    category: "sql_advanced",
    title: "스칼라 서브쿼리",
    front: "SELECT 절 서브쿼리가 2행을 반환하면?",
    summary:
      "스칼라 서브쿼리=SELECT 절에서 한 행·한 컬럼(단일값) 반환. 각 행마다 실행.",
    trap: "스칼라 서브쿼리가 2행 이상 반환하면 오류. 매칭 없으면 NULL 반환.",
    example: "SELECT name, (SELECT dname FROM dept WHERE …) FROM emp.",
    tags: ["서브쿼리", "스칼라"],
  },
  {
    id: "c-inline-view",
    category: "sql_advanced",
    title: "인라인 뷰",
    front: "FROM 절에 들어가는 서브쿼리를 뭐라 부를까?",
    summary:
      "인라인 뷰=FROM 절 서브쿼리(가상 테이블처럼 사용). Top-N, 사전 집계 후 조인 등에 활용.",
    trap: "인라인 뷰 안에서 만든 별칭을 바깥에서 컬럼으로 참조 가능.",
    example: "SELECT * FROM (SELECT … ORDER BY sal DESC) WHERE ROWNUM<=3.",
    tags: ["서브쿼리", "인라인뷰"],
  },
  {
    id: "c-correlated",
    category: "sql_advanced",
    title: "연관 서브쿼리 · EXISTS",
    front: "연관(상관) 서브쿼리는 언제 실행될까?",
    summary:
      "연관 서브쿼리=메인 쿼리 컬럼을 참조 → 메인 행마다 실행. EXISTS: 존재하면 참(값 자체는 안 봄).",
    trap: "EXISTS는 첫 매칭에서 즉시 참 → 대량 데이터에서 IN보다 유리할 때가 있다.",
    example: "WHERE EXISTS (SELECT 1 FROM 주문 WHERE 주문.cid=고객.id).",
    tags: ["서브쿼리", "EXISTS", "연관"],
  },
  {
    id: "c-view",
    category: "sql_advanced",
    title: "뷰 (View)",
    front: "뷰는 실제 데이터를 저장할까?",
    summary:
      "뷰=쿼리로 정의된 가상 테이블(데이터 미저장). 장점: 독립성·편의성·보안(필요 컬럼만 노출).",
    trap: "뷰는 SQL만 저장하고 실행 시 원본 조회. 복잡 조인·집계 뷰는 갱신 제약이 있다.",
    example: "CREATE VIEW v_emp AS SELECT id,name FROM emp → 급여 숨기고 노출.",
    tags: ["뷰"],
  },
  {
    id: "c-setop",
    category: "sql_advanced",
    title: "집합 연산자",
    front: "{A,B} UNION {B,C} 의 행 수는?",
    summary:
      "UNION(합집합·중복제거·정렬수반), UNION ALL(중복유지), INTERSECT(교집합), MINUS/EXCEPT(차집합).",
    trap: "컬럼 개수·타입 호환 필수. 결과 컬럼명은 첫 SELECT 기준. UNION은 정렬 비용 발생.",
    example: "{A,B} UNION {B,C} → 3행(B 하나). UNION ALL → 4행.",
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
    id: "c-grouping-sets",
    category: "sql_advanced",
    title: "GROUPING SETS",
    front: "GROUPING SETS는 ROLLUP과 뭐가 다를까?",
    summary:
      "GROUPING SETS: 원하는 그룹 조합만 나열해 집계(계층·순서 무관). 여러 GROUP BY를 UNION ALL 한 효과.",
    trap: "GROUPING SETS는 계층 소계가 아니라 '지정한 집합들'만 만든다.",
    example: "GROUP BY GROUPING SETS((dept),(job),()) → 부서별+직무별+총계.",
    tags: ["GROUPING SETS"],
  },
  {
    id: "c-window",
    category: "sql_advanced",
    title: "윈도우 함수 (순위)",
    front: "값 100,100,90 일 때 RANK와 DENSE_RANK는?",
    summary:
      "RANK(1,2,2,4 건너뜀), DENSE_RANK(1,2,2,3), ROW_NUMBER(1,2,3,4 유일). OVER(PARTITION BY … ORDER BY …).",
    trap: "윈도우 함수는 행을 줄이지 않는다(PARTITION BY ≠ GROUP BY).",
    example: "100,100,90 → RANK 1,1,3 / DENSE_RANK 1,1,2.",
    tags: ["윈도우함수", "RANK"],
  },
  {
    id: "c-window-agg",
    category: "sql_advanced",
    title: "윈도우 집계 (누적/그룹)",
    front: "SUM(sal) OVER (ORDER BY …) 는 무엇을 만들까?",
    summary:
      "집계함수 + OVER → 행을 유지한 채 그룹/누적 집계. ORDER BY가 있으면 누적(running) 집계.",
    trap: "OVER에 ORDER BY만 있고 프레임 미지정이면 기본이 '처음~현재행'(누적).",
    example: "SUM(sal) OVER (PARTITION BY dept) → 부서합을 각 행에 표시.",
    tags: ["윈도우함수", "누적"],
  },
  {
    id: "c-window-frame",
    category: "sql_advanced",
    title: "윈도우 프레임 (ROWS/RANGE)",
    front: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW 는?",
    summary:
      "프레임=집계 대상 행 범위. ROWS(물리적 행 수)·RANGE(값 범위). UNBOUNDED PRECEDING=처음, CURRENT ROW=현재.",
    trap: "LAST_VALUE는 기본 프레임(현재행까지)이라 원하는 값이 안 나올 수 있음 → 프레임을 UNBOUNDED FOLLOWING까지 확장.",
    example: "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING → 이웃 3행 이동평균.",
    tags: ["윈도우함수", "프레임"],
  },
  {
    id: "c-lag-lead",
    category: "sql_advanced",
    title: "LAG / LEAD",
    front: "이전 행·다음 행 값을 가져오는 함수는?",
    summary:
      "LAG(컬럼, n, 기본값): n행 이전. LEAD(컬럼, n, 기본값): n행 다음. 증감·전월대비 계산에 사용.",
    trap: "경계(첫/마지막 행)에서는 기본값(미지정 시 NULL)이 반환된다.",
    example: "매출 - LAG(매출) OVER(ORDER BY 월) → 전월 대비 증감.",
    tags: ["윈도우함수", "LAG", "LEAD"],
  },
  {
    id: "c-window-ratio",
    category: "sql_advanced",
    title: "비율/분할 윈도우 함수",
    front: "NTILE(4)는 무엇을 하나?",
    summary:
      "RATIO_TO_REPORT(전체 대비 비율), PERCENT_RANK/CUME_DIST(백분위), NTILE(n)(n등분 그룹 번호).",
    trap: "NTILE(4)=4분위로 균등 분할. 나누어떨어지지 않으면 앞 그룹에 1개씩 더.",
    example: "NTILE(4) OVER(ORDER BY sal) → 급여 4분위(1~4) 부여.",
    tags: ["윈도우함수", "NTILE", "비율"],
  },
  {
    id: "c-rownum",
    category: "sql_advanced",
    title: "ROWNUM / Top-N",
    front: "WHERE ROWNUM<=3 ORDER BY sal DESC 는 왜 오답?",
    summary:
      "Oracle ROWNUM은 정렬 전에 매겨진다. 상위 N은 인라인뷰로 먼저 정렬 후 바깥에서 ROWNUM.",
    trap:
      "WHERE ROWNUM<=3 ORDER BY …는 정렬 전에 잘림 → 오답. ROWNUM>1 조건은 항상 거짓.",
    example:
      "상위 3명 → SELECT * FROM (SELECT … ORDER BY sal DESC) WHERE ROWNUM<=3.",
    tags: ["ROWNUM", "TopN"],
  },
  {
    id: "c-rownum-rowid",
    category: "sql_advanced",
    title: "ROWNUM vs ROWID",
    front: "ROWNUM과 ROWID는 각각 무엇일까?",
    summary:
      "ROWNUM=결과 집합의 순번(의사컬럼, 조회마다 부여). ROWID=행의 물리적 주소(가장 빠른 단일행 접근 경로).",
    trap: "ROWID는 데이터가 저장된 물리 위치라 변하지 않는 한 가장 빠른 액세스.",
    example: "SELECT ROWID, ROWNUM, ename FROM emp.",
    tags: ["ROWNUM", "ROWID"],
  },
  {
    id: "c-hierarchy",
    category: "sql_advanced",
    title: "계층형 질의",
    front: "CONNECT BY에서 전개 방향을 결정하는 것은?",
    summary:
      "START WITH(루트) + CONNECT BY PRIOR(부모-자식 전개). LEVEL(깊이,루트=1), CONNECT_BY_ISLEAF(잎=1), SYS_CONNECT_BY_PATH(경로).",
    trap: "PRIOR의 위치가 정방향/역방향을 결정. START WITH는 루트 지정일 뿐 전개규칙 아님.",
    example: "CONNECT BY PRIOR empno = mgr → 상위(부모)에서 하위로 전개.",
    tags: ["계층질의", "CONNECT BY"],
  },
  {
    id: "c-pivot",
    category: "sql_advanced",
    title: "PIVOT / UNPIVOT",
    front: "PIVOT과 UNPIVOT은 각각 무엇을 바꿀까?",
    summary:
      "PIVOT: 행 → 열(값을 컬럼으로 펼침, 집계 수반). UNPIVOT: 열 → 행(컬럼을 값으로 접음).",
    trap: "PIVOT은 집계함수가 필요. UNPIVOT은 NULL을 기본 제외(INCLUDE NULLS로 포함).",
    example: "월별 매출 행을 1월·2월…컬럼으로 펼치기 → PIVOT.",
    tags: ["PIVOT", "UNPIVOT"],
  },

  // ══════════════════════════════════════════════════════
  // 과목 2 · 관리 구문 (sql_management)
  // ══════════════════════════════════════════════════════
  {
    id: "c-ddl",
    category: "sql_management",
    title: "DDL 종류",
    front: "CREATE·ALTER·DROP·TRUNCATE·RENAME의 공통점은?",
    summary:
      "DDL=객체 정의. CREATE(생성)·ALTER(변경)·DROP(삭제)·TRUNCATE(전체행 삭제)·RENAME(이름). 실행 즉시 자동 커밋.",
    trap: "DDL은 자동 커밋되어 직전 DML까지 함께 확정 → ROLLBACK 불가.",
    example: "DELETE 후 TRUNCATE 실행하면 DELETE도 커밋되어 되돌릴 수 없다.",
    tags: ["DDL"],
  },
  {
    id: "c-alter-table",
    category: "sql_management",
    title: "ALTER TABLE",
    front: "컬럼 추가/수정/삭제는 어떤 명령으로?",
    summary:
      "ADD(컬럼·제약 추가), MODIFY(자료형·기본값 변경), DROP COLUMN(컬럼 삭제), RENAME COLUMN.",
    trap: "이미 데이터가 있는 컬럼을 호환 안 되는 타입으로 MODIFY 하면 실패할 수 있다.",
    example: "ALTER TABLE emp ADD (email VARCHAR2(50));",
    tags: ["ALTER", "DDL"],
  },
  {
    id: "c-dml-merge",
    category: "sql_management",
    title: "DELETE vs TRUNCATE vs DROP",
    front: "TRUNCATE는 ROLLBACK으로 되돌릴 수 있을까?",
    summary:
      "DELETE(DML·조건 삭제·롤백 가능), TRUNCATE(DDL·전체 삭제·자동커밋·공간 반납), DROP(구조까지 삭제).",
    trap: "TRUNCATE는 DDL이라 ROLLBACK 불가. DELETE는 WHERE로 일부만 삭제 가능.",
    example: "MERGE … WHEN MATCHED THEN UPDATE / WHEN NOT MATCHED THEN INSERT.",
    tags: ["DML", "TRUNCATE", "MERGE"],
  },
  {
    id: "c-insert",
    category: "sql_management",
    title: "INSERT",
    front: "컬럼 목록을 생략하고 INSERT 하려면?",
    summary:
      "INSERT INTO t(col…) VALUES(…). 컬럼 생략 시 테이블의 모든 컬럼에 정의 순서대로 값 필요.",
    trap: "컬럼 목록을 생략하면 모든 컬럼 값을 순서대로 다 줘야 함(NOT NULL·개수 주의).",
    example: "INSERT INTO dept VALUES(10,'SALES') → 모든 컬럼 순서대로.",
    tags: ["INSERT", "DML"],
  },
  {
    id: "c-tcl",
    category: "sql_management",
    title: "TCL (트랜잭션 제어)",
    front: "SAVEPOINT는 무엇에 쓰나?",
    summary:
      "COMMIT(확정), ROLLBACK(취소), SAVEPOINT(부분 롤백 지점). ROLLBACK TO savepoint로 일부만 되돌림.",
    trap: "DDL은 자동 커밋되어 이전 트랜잭션도 확정된다.",
    example: "SAVEPOINT s1; … ROLLBACK TO s1; → s1 이후 변경만 취소.",
    tags: ["TCL", "COMMIT", "SAVEPOINT"],
  },
  {
    id: "c-constraint",
    category: "sql_management",
    title: "제약조건 & 참조 무결성",
    front: "UNIQUE 컬럼에 NULL은 여러 개 들어갈 수 있을까?",
    summary:
      "PK(UNIQUE+NOT NULL, 테이블당 1개), UNIQUE(NULL 허용), CHECK, NOT NULL, FK(참조), DEFAULT.",
    trap: "UNIQUE는 NULL 다수 허용. FK 참조 옵션 ON DELETE CASCADE/SET NULL/RESTRICT.",
    example: "복합키는 여러 컬럼으로 PK 구성 가능하나 PK 자체는 테이블당 하나.",
    tags: ["제약조건", "PK", "FK"],
  },
  {
    id: "c-dcl",
    category: "sql_management",
    title: "DCL (권한)",
    front: "WITH GRANT OPTION 을 주면?",
    summary:
      "GRANT(권한 부여), REVOKE(회수), ROLE(권한 묶음). WITH GRANT OPTION은 재부여 권한.",
    trap: "WITH GRANT OPTION으로 받은 사용자는 그 권한을 남에게 다시 부여할 수 있다.",
    example: "GRANT SELECT ON emp TO hr WITH GRANT OPTION;",
    tags: ["DCL", "GRANT"],
  },
  {
    id: "c-optimizer",
    category: "sql_management",
    title: "옵티마이저 & 실행계획",
    front: "규칙 기반(RBO)과 비용 기반(CBO) 옵티마이저의 차이는?",
    summary:
      "옵티마이저=최적 실행경로 결정. RBO(정해진 우선순위 규칙), CBO(통계정보로 비용 최소 경로 선택·현대 기본).",
    trap: "CBO는 통계정보가 부정확하면 나쁜 계획을 세울 수 있다 → 통계 최신화 중요.",
    example: "인덱스 유무·데이터 분포(통계)에 따라 CBO가 풀스캔/인덱스스캔 선택.",
    tags: ["옵티마이저", "실행계획"],
  },
  {
    id: "c-index-mgmt",
    category: "sql_management",
    title: "인덱스 종류",
    front: "B-tree 인덱스와 비트맵 인덱스는 언제 쓸까?",
    summary:
      "B-tree(범용, 카디널리티 높은 컬럼). Bitmap(카디널리티 낮은 컬럼·집계). 인덱스는 조회↑·DML↓.",
    trap: "성별·상태처럼 값 종류가 적은 컬럼은 Bitmap이 유리, 갱신 잦으면 부적합.",
    example: "CREATE INDEX idx_emp_dept ON emp(dept);",
    tags: ["인덱스", "B-tree", "비트맵"],
  },
];

/** 개념 카테고리 → 표시 그룹(카드 필터 칩용) */
export const CONCEPT_GROUPS: { key: "all" | "sql" | "modeling"; label: string }[] =
  [
    { key: "all", label: "전체" },
    { key: "sql", label: "SQL" },
    { key: "modeling", label: "데이터모델링" },
  ];
