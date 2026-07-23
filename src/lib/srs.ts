// 간격 반복(SRS) 로직 — 틀린 문제를 1일 / 3일 / 7일 뒤 재출제
import type { Confidence, Review } from "./types";

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

/** 현재 stage 간격만큼 dueAt만 미루고 stage는 유지 (제자리 반복) */
function holdReview(review: Review, now: Date): Review {
  const last = REVIEW_INTERVALS_DAYS.length - 1;
  const days = REVIEW_INTERVALS_DAYS[Math.min(review.stage, last)];
  return {
    questionId: review.questionId,
    stage: review.stage,
    dueAt: addDays(now, days),
    updatedAt: now.toISOString(),
  };
}

/**
 * 채점 결과 + 확신도를 반영해 다음 복습 스케줄을 결정한다. (SRS v2)
 *
 * - 오답: stage 0(1일 뒤)로 리셋 — 확신도 무관.
 * - 정답 + '확실함': 아는 문제. 기존 복습이 있으면 단계 전진(→졸업), 없으면 스케줄 없음.
 * - 정답 + '애매함'/'찍음': 확실히 아는 게 아님.
 *     · 기존 복습 있으면 단계 '전진 없이' 다시(현재 간격 뒤) → 실력이 굳을 때까지 붙잡아 둠.
 *     · 없으면 stage 0(1일 뒤)로 새로 등록 → 취약 문제를 복습 대상에 포함.
 *
 * 반환 null = 복습 없음/졸업(스케줄 제거).
 */
export function nextReviewOnAnswer(
  questionId: string,
  existing: Review | undefined,
  isCorrect: boolean,
  confidence: Confidence,
  now: Date = new Date()
): Review | null {
  if (!isCorrect) {
    return scheduleOnWrong(questionId, now);
  }
  const confident = confidence === "sure";
  if (confident) {
    return existing ? advanceReview(existing, true, now) : null;
  }
  // 정답이지만 애매/찍음
  return existing
    ? holdReview(existing, now)
    : scheduleOnWrong(questionId, now);
}

/** 지금 복습 예정(마감 지난) 문제 id 목록 */
export function dueReviewIds(reviews: Review[], now: Date = new Date()): string[] {
  const t = now.getTime();
  return reviews
    .filter((r) => new Date(r.dueAt).getTime() <= t)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .map((r) => r.questionId);
}
