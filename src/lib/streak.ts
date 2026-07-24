// 일일 학습 진행 & 연속 학습일(스트릭) — attempts에서 파생 계산 (별도 저장 불필요)
import type { Attempt } from "./types";

/** 로컬 시간대 기준 YYYY-MM-DD */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 학습한 날짜(로컬) 집합 */
export function studyDays(attempts: Attempt[]): Set<string> {
  const s = new Set<string>();
  for (const a of attempts) s.add(dayKey(new Date(a.answeredAt)));
  return s;
}

/** 오늘 푼 문제 수 (같은 문제 재풀이도 각각 1회로 계산) */
export function todayCount(attempts: Attempt[], now: Date = new Date()): number {
  const key = dayKey(now);
  return attempts.filter((a) => dayKey(new Date(a.answeredAt)) === key).length;
}

/** 오늘 처음 푼 '고유 문제' 수 (오늘의 목표 달성 판정용) */
export function todayUniqueCount(
  attempts: Attempt[],
  now: Date = new Date()
): number {
  const key = dayKey(now);
  const ids = new Set<string>();
  for (const a of attempts) {
    if (dayKey(new Date(a.answeredAt)) === key) ids.add(a.questionId);
  }
  return ids.size;
}

function shift(d: Date, days: number): Date {
  const n = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  n.setDate(n.getDate() + days);
  return n;
}

/**
 * 연속 학습일. 오늘 학습했으면 오늘부터, 아직 안 했지만 어제 학습했으면
 * 어제까지의 연속일을 유지(스트릭이 아직 살아있음)로 계산한다.
 */
export function currentStreak(attempts: Attempt[], now: Date = new Date()): number {
  const days = studyDays(attempts);
  if (days.size === 0) return 0;

  const today = dayKey(now);
  const yesterday = dayKey(shift(now, -1));
  // 시작점: 오늘 학습 O -> 오늘, 아니면 어제 학습 O -> 어제, 둘 다 X -> 스트릭 끊김(0)
  let cursor: Date;
  if (days.has(today)) cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (days.has(yesterday)) cursor = shift(now, -1);
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = shift(cursor, -1);
  }
  return streak;
}

export interface DayCount {
  key: string; // YYYY-MM-DD
  label: string; // 요일 or 일
  count: number; // 그날 학습(study) 푼 문항 수
}

/** 최근 N일 일별 학습량(모의고사 제외). 오늘이 마지막. */
export function recentDailyStudy(
  attempts: Attempt[],
  days: number,
  now: Date = new Date()
): DayCount[] {
  const counts = new Map<string, number>();
  for (const a of attempts) {
    if (a.source === "mock") continue;
    const k = dayKey(new Date(a.answeredAt));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: DayCount[] = [];
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const WD = ["일", "월", "화", "수", "목", "금", "토"];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    out.push({ key: k, label: WD[d.getDay()], count: counts.get(k) ?? 0 });
  }
  return out;
}

export interface DailyProgress {
  done: number; // 오늘 푼 고유 문제 수
  goal: number;
  ratio: number; // 0~1
  reached: boolean;
  streak: number;
}

export function dailyProgress(
  attempts: Attempt[],
  goal: number,
  now: Date = new Date()
): DailyProgress {
  // 오늘의 목표 진행은 '학습' 풀이만 집계(모의고사 50문항이 목표를 자동 달성하지 않도록).
  // 스트릭(연속 학습일)은 모의고사도 학습 활동으로 인정해 전체 기준으로 계산.
  const study = attempts.filter((a) => a.source !== "mock");
  const done = todayUniqueCount(study, now);
  const g = Math.max(1, goal);
  return {
    done,
    goal: g,
    ratio: Math.min(1, done / g),
    reached: done >= g,
    streak: currentStreak(attempts, now),
  };
}
