// 2026년 SQLD(SQL 개발자) 정기시험 일정 — 연 4회(제60~63회)
// 출처: 한국데이터산업진흥원 데이터자격검정(dataq.or.kr) 및 공개 일정 정리.
// 접수는 통상 시험 4~5주 전 시작(변동 가능) — 정확한 접수는 공식 사이트 확인.

export interface ExamSession {
  round: number; // 회차
  label: string; // "제60회"
  date: string; // 시험일 YYYY-MM-DD (로컬)
}

export const SQLD_EXAMS: ExamSession[] = [
  { round: 60, label: "제60회", date: "2026-03-07" },
  { round: 61, label: "제61회", date: "2026-05-31" },
  { round: 62, label: "제62회", date: "2026-08-22" },
  { round: 63, label: "제63회", date: "2026-11-14" },
];

/** 오늘(로컬) 기준 아직 지나지 않은 다음 회차. 없으면 마지막 회차. */
export function nextExamSession(now: Date = new Date()): ExamSession {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming = SQLD_EXAMS.find(
    (e) => new Date(e.date + "T00:00:00").getTime() >= today.getTime()
  );
  return upcoming ?? SQLD_EXAMS[SQLD_EXAMS.length - 1];
}

/** 특정 날짜에 해당하는 회차(없으면 null) — 히어로 라벨 표시용 */
export function sessionForDate(date: string): ExamSession | null {
  return SQLD_EXAMS.find((e) => e.date === date) ?? null;
}
