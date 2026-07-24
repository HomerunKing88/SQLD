// 저장소 추상화 — 기본 구현은 localStorage (오프라인·무로그인).
// Supabase 동기화가 필요하면 동일 인터페이스로 교체 가능.
import type {
  Attempt,
  CardProgress,
  CardRating,
  MockResult,
  Review,
  Settings,
} from "./types";

const KEYS = {
  attempts: "sqld.attempts",
  reviews: "sqld.reviews",
  settings: "sqld.settings",
  mocks: "sqld.mocks",
  cards: "sqld.cards",
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
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패(쿼터 초과 / iOS 프라이빗 모드)에도 앱 흐름이 끊기지 않도록 무시.
    // 데이터는 메모리 상태로 유지되며, 백업(내보내기)으로 대비한다.
  }
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

  // --- mock exams ---
  getMocks(): MockResult[] {
    return read<MockResult[]>(KEYS.mocks, []);
  },
  addMock(m: MockResult): void {
    const all = repository.getMocks();
    all.push(m);
    write(KEYS.mocks, all);
  },

  // --- 개념 카드 진행(점수 통계와 분리) ---
  getCardProgress(): Record<string, CardProgress> {
    return read<Record<string, CardProgress>>(KEYS.cards, {});
  },
  markCard(conceptId: string, rating: CardRating, now: Date = new Date()): void {
    const all = repository.getCardProgress();
    const prev = all[conceptId];
    all[conceptId] = {
      conceptId,
      rating,
      seenCount: (prev?.seenCount ?? 0) + 1,
      updatedAt: now.toISOString(),
    };
    write(KEYS.cards, all);
  },

  // --- settings ---
  getSettings(): Settings {
    const s = read<Settings>(KEYS.settings, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...s };
  },
  saveSettings(s: Settings): void {
    write(KEYS.settings, s);
  },

  /** 학습 기록만 초기화(설정·시험일은 유지) */
  resetProgress(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEYS.attempts);
    window.localStorage.removeItem(KEYS.reviews);
    window.localStorage.removeItem(KEYS.mocks);
    window.localStorage.removeItem(KEYS.cards);
  },

  /** 전체 초기화(설정 포함) */
  reset(): void {
    if (typeof window === "undefined") return;
    repository.resetProgress();
    window.localStorage.removeItem(KEYS.settings);
  },

  // --- 백업(내보내기/가져오기) ---
  exportBundle(): BackupBundle {
    return {
      app: "sqld-30day",
      version: 1,
      attempts: repository.getAttempts(),
      reviews: repository.getReviews(),
      mocks: repository.getMocks(),
      cards: repository.getCardProgress(),
      settings: repository.getSettings(),
    };
  },
  /** 백업 복원. 유효하지 않으면 false. */
  importBundle(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const b = data as Partial<BackupBundle>;
    if (b.app !== "sqld-30day" || !Array.isArray(b.attempts)) return false;
    write(KEYS.attempts, b.attempts ?? []);
    write(KEYS.reviews, Array.isArray(b.reviews) ? b.reviews : []);
    write(KEYS.mocks, Array.isArray(b.mocks) ? b.mocks : []);
    write(
      KEYS.cards,
      b.cards && typeof b.cards === "object" && !Array.isArray(b.cards)
        ? b.cards
        : {}
    );
    if (b.settings && typeof b.settings === "object") {
      write(KEYS.settings, { ...DEFAULT_SETTINGS, ...b.settings });
    }
    return true;
  },
};

export interface BackupBundle {
  app: "sqld-30day";
  version: number;
  attempts: Attempt[];
  reviews: Review[];
  mocks: MockResult[];
  cards?: Record<string, CardProgress>;
  settings: Settings;
}

export type Repository = typeof repository;
