// 저장소 추상화 — 기본 구현은 localStorage (오프라인·무로그인).
// Supabase 동기화가 필요하면 동일 인터페이스로 교체 가능.
import type { Attempt, Review, Settings } from "./types";

const KEYS = {
  attempts: "sqld.attempts",
  reviews: "sqld.reviews",
  settings: "sqld.settings",
};

export const DEFAULT_SETTINGS: Settings = {
  // 기본 시험일: 30일 뒤 (설정에서 변경). 실제 값은 클라이언트에서 보정.
  examDate: "",
  dailyGoal: 20,
  sqlWeight: 0.7,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const repository = {
  // --- attempts ---
  getAttempts(): Attempt[] {
    return read<Attempt[]>(KEYS.attempts, []);
  },
  addAttempt(a: Attempt): void {
    const all = repository.getAttempts();
    all.push(a);
    write(KEYS.attempts, all);
  },

  // --- reviews ---
  getReviews(): Review[] {
    return read<Review[]>(KEYS.reviews, []);
  },
  getReview(questionId: string): Review | undefined {
    return repository.getReviews().find((r) => r.questionId === questionId);
  },
  /** review === null 이면 해당 문제 복습 제거(졸업) */
  upsertReview(questionId: string, review: Review | null): void {
    const all = repository.getReviews().filter((r) => r.questionId !== questionId);
    if (review) all.push(review);
    write(KEYS.reviews, all);
  },

  // --- settings ---
  getSettings(): Settings {
    const s = read<Settings>(KEYS.settings, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...s };
  },
  saveSettings(s: Settings): void {
    write(KEYS.settings, s);
  },

  reset(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEYS.attempts);
    window.localStorage.removeItem(KEYS.reviews);
    window.localStorage.removeItem(KEYS.settings);
  },
};

export type Repository = typeof repository;
