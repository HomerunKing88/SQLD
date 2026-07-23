// 간격 반복(SRS) 로직 — 틀린 문제를 1일 / 3일 / 7일 뒤 재출제
import type { Review } from "./types";

/** stage -> 다음 복습까지 일수. stage가 배열 길이 이상이면 졸업. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7];

export function isGraduated(stage: number): boolean {
  return stage >= REVIEW_INTERVALS_DAYS.length;
}

function addDays(from: Date, days: number): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** 문제를 틀렸을 때: 복습을 stage 0(1일 뒤)으로 (재)설정 */
export function scheduleOnWrong(
  questionId: string,
  now: Date = new Date()
): Review {
  return {
    questionId,
    stage: 0,
    dueAt: addDays(now, REVIEW_INTERVALS_DAYS[0]),
    updatedAt: now.toISOString(),
  };
}

/**
 * 복습 문제를 다시 풀었을 때 스케줄 갱신.
 * - 맞으면 stage 전진 (다음 간격). 마지막 간격을 넘기면 졸업(null 반환 → 스케줄 제거).
 * - 틀리면 stage 0으로 리셋.
 * 반환 null = 복습 졸업(스케줄에서 제거).
 */
export function advanceReview(
  review: Review,
  correct: boolean,
  now: Date = new Date()
): Review | null {
  if (!correct) {
    return scheduleOnWrong(review.questionId, now);
  }
  const nextStage = review.stage + 1;
  if (isGraduated(nextStage)) {
    return null; // 졸업
  }
  return {
    questionId: review.questionId,
    stage: nextStage,
    dueAt: addDays(now, REVIEW_INTERVALS_DAYS[nextStage]),
    updatedAt: now.toISOString(),
  };
}

/** 지금 복습 예정(마감 지난) 문제 id 목록 */
export function dueReviewIds(reviews: Review[], now: Date = new Date()): string[] {
  const t = now.getTime();
  return reviews
    .filter((r) => new Date(r.dueAt).getTime() <= t)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .map((r) => r.questionId);
}
