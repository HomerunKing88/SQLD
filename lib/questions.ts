export type Confidence = '확실함' | '애매함' | '찍음';
export type Question = { id:number; area:'데이터 모델링'|'SQL 기본 및 활용'; type:string; question:string; choices:string[]; answer:number; explanation:string; sql?:string; stages?: {label:string; detail:string}[] };
const sqlStages = [
 { label:'FROM / JOIN', detail:'EMP e 와 DEPT d를 부서번호로 결합합니다. (14행)' },
 { label:'WHERE', detail:'SAL >= 3000 인 직원만 남습니다. (5행)' },
 { label:'GROUP BY', detail:'부서별로 5행을 묶습니다. (3그룹)' },
 { label:'HAVING', detail:'평균 급여가 3,000 이상인 그룹을 유지합니다. (2그룹)' },
 { label:'SELECT', detail:'부서명과 평균 급여를 계산해 표시합니다.' },
 { label:'ORDER BY', detail:'평균 급여 내림차순으로 정렬합니다.' }
];
export const questions: Question[] = [
 {id:1,area:'SQL 기본 및 활용',type:'집계',question:'GROUP BY 절에 없는 컬럼을 SELECT 절에 단독으로 사용할 수 있는 경우는?',choices:['항상 가능','집계 함수로 감쌀 때','WHERE가 있을 때','ORDER BY가 있을 때'],answer:1,explanation:'GROUP BY로 묶이지 않은 컬럼은 집계 함수의 인수로만 사용할 수 있습니다.'},
 {id:2,area:'SQL 기본 및 활용',type:'JOIN',question:'INNER JOIN의 결과로 옳은 것은?',choices:['왼쪽 테이블의 모든 행','오른쪽 테이블의 모든 행','조인 조건이 일치하는 행','일치하지 않는 행만'],answer:2,explanation:'INNER JOIN은 양쪽 조인 조건이 일치하는 행만 반환합니다.',sql:'SELECT d.deptno, AVG(e.sal) FROM emp e JOIN dept d ON e.deptno=d.deptno WHERE e.sal >= 3000 GROUP BY d.deptno HAVING AVG(e.sal)>=3000 ORDER BY AVG(e.sal) DESC;',stages:sqlStages},
 {id:3,area:'SQL 기본 및 활용',type:'NULL',question:'NULL과 관련해 참인 설명은?',choices:['NULL = NULL은 TRUE','NULL은 0이다','IS NULL로 비교한다','COUNT(*)는 NULL을 제외한다'],answer:2,explanation:'NULL은 미지의 값이므로 = 대신 IS NULL / IS NOT NULL로 판별합니다.'},
 {id:4,area:'SQL 기본 및 활용',type:'집합 연산자',question:'중복 행까지 포함하여 두 SELECT 결과를 합치는 연산자는?',choices:['UNION','UNION ALL','INTERSECT','MINUS'],answer:1,explanation:'UNION ALL은 중복 제거 없이 결과를 이어 붙입니다.'},
 {id:5,area:'SQL 기본 및 활용',type:'서브쿼리',question:'단일 행 서브쿼리와 함께 사용할 수 없는 연산자는?',choices:['=','>','IN','<>'],answer:2,explanation:'IN은 다중 행 서브쿼리 비교 연산자입니다.'},
 {id:6,area:'SQL 기본 및 활용',type:'분석 함수',question:'RANK()와 DENSE_RANK()의 차이는?',choices:['정렬 불가','동점 다음 순위의 건너뜀 여부','파티션 사용 여부','NULL 처리'],answer:1,explanation:'RANK는 동점 다음 순위를 건너뛰고 DENSE_RANK는 연속 순위를 부여합니다.'},
 {id:7,area:'SQL 기본 및 활용',type:'DDL',question:'테이블 구조를 변경하는 명령은?',choices:['INSERT','ALTER','UPDATE','DELETE'],answer:1,explanation:'ALTER는 테이블 등의 객체 정의를 변경하는 DDL입니다.'},
 {id:8,area:'SQL 기본 및 활용',type:'트랜잭션',question:'COMMIT 이후 ROLLBACK의 결과는?',choices:['커밋을 취소한다','아무 변경도 취소하지 못한다','자동 커밋한다','세이브포인트로 이동한다'],answer:1,explanation:'COMMIT된 트랜잭션은 ROLLBACK으로 되돌릴 수 없습니다.'},
 {id:9,area:'SQL 기본 및 활용',type:'조건',question:'BETWEEN A AND B는 어떤 범위를 포함하는가?',choices:['A, B 모두 포함','A만 포함','B만 포함','둘 다 제외'],answer:0,explanation:'BETWEEN은 경계값 A와 B를 모두 포함합니다.'},
 {id:10,area:'SQL 기본 및 활용',type:'JOIN',question:'LEFT OUTER JOIN은 무엇을 보장하는가?',choices:['오른쪽 모든 행','왼쪽 모든 행','일치 행만','NULL이 없는 행'],answer:1,explanation:'LEFT OUTER JOIN은 왼쪽 테이블의 모든 행을 보존합니다.'},
 {id:11,area:'데이터 모델링',type:'정규화',question:'부분 함수 종속을 제거하는 정규형은?',choices:['1정규형','2정규형','3정규형','BCNF'],answer:1,explanation:'2정규형은 복합키의 일부에만 종속되는 부분 함수 종속을 제거합니다.'},
 {id:12,area:'데이터 모델링',type:'식별자',question:'인조 식별자의 특징으로 가장 적절한 것은?',choices:['업무 의미가 반드시 있다','업무 변경에 민감하다','시스템이 부여한다','복합키만 가능하다'],answer:2,explanation:'인조 식별자는 업무 의미와 무관하게 시스템이 부여하는 대체 키입니다.'},
 {id:13,area:'SQL 기본 및 활용',type:'함수',question:'COUNT(컬럼)이 세는 것은?',choices:['전체 행','NULL을 포함한 행','NULL이 아닌 값','중복 제거 값'],answer:2,explanation:'COUNT(표현식)는 NULL이 아닌 표현식의 개수를 셉니다.'},
 {id:14,area:'SQL 기본 및 활용',type:'뷰',question:'뷰에 대한 설명으로 옳은 것은?',choices:['항상 물리 데이터를 저장','기본 테이블의 논리적 창','인덱스를 가질 수 없음','SELECT 불가'],answer:1,explanation:'일반 뷰는 하나 이상의 기본 테이블에 대한 논리적 창입니다.'},
 {id:15,area:'SQL 기본 및 활용',type:'집계',question:'HAVING 절이 수행되는 시점으로 가장 가까운 것은?',choices:['FROM 이전','WHERE 이전','GROUP BY 이후','ORDER BY 이후'],answer:2,explanation:'HAVING은 GROUP BY로 만든 그룹을 대상으로 조건을 적용합니다.'},
 {id:16,area:'SQL 기본 및 활용',type:'DML',question:'DELETE와 TRUNCATE의 차이로 옳은 것은?',choices:['둘 다 DDL','DELETE는 WHERE 사용 가능','TRUNCATE는 행 단위 로깅','DELETE는 롤백 불가'],answer:1,explanation:'DELETE는 DML이며 WHERE 조건으로 일부 행을 삭제할 수 있습니다.'},
 {id:17,area:'데이터 모델링',type:'관계',question:'부모 하나에 자식 여러 개가 연결되는 관계는?',choices:['1:1','1:M','M:N','식별 관계 아님'],answer:1,explanation:'한 부모 인스턴스에 여러 자식 인스턴스가 연결되면 1:M 관계입니다.'},
 {id:18,area:'SQL 기본 및 활용',type:'정렬',question:'ORDER BY 절에서 별칭 사용은?',choices:['불가능','SELECT 별칭 사용 가능','WHERE에서만 가능','GROUP BY에서만 가능'],answer:1,explanation:'ORDER BY에서는 SELECT 절에서 정의한 컬럼 별칭을 사용할 수 있습니다.'},
 {id:19,area:'SQL 기본 및 활용',type:'CASE',question:'조건에 따라 값을 반환하는 표준 SQL 표현식은?',choices:['DECODE만','CASE','NVL','COALESCE'],answer:1,explanation:'CASE 표현식은 표준 SQL의 조건 분기 표현식입니다.'},
 {id:20,area:'SQL 기본 및 활용',type:'인덱스',question:'인덱스가 특히 유리한 경우는?',choices:['테이블 전체 대부분 조회','선택도가 높은 조건 조회','매 행 대량 갱신','항상 정렬 없음'],answer:1,explanation:'적은 행을 골라내는 선택도 높은 조건에서 인덱스 효율이 좋습니다.'}
];
