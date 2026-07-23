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
  const done = todayUniqueCount(attempts, now);
  const g = Math.max(1, goal);
  return {
    done,
    goal: g,
    ratio: Math.min(1, done / g),
    reached: done >= g,
    streak: currentStreak(attempts, now),
  };
}
