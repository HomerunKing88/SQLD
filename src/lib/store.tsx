"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Attempt,
  Confidence,
  MockResult,
  Review,
  Settings,
} from "./types";
import { repository, DEFAULT_SETTINGS } from "./repository";
import { nextReviewOnAnswer, scheduleOnWrong } from "./srs";
import { scoreMock } from "./mock";
import { QUESTIONS } from "@/data/questions";

interface StoreValue {
  ready: boolean;
  settings: Settings;
  attempts: Attempt[];
  reviews: Review[];
  mocks: MockResult[];
  saveSettings: (s: Settings) => void;
  /** 채점 처리: attempt 저장 + 복습 스케줄 갱신 */
  submitAnswer: (args: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    confidence: Confidence;
  }) => void;
  /** 모의고사 제출: 문항별 기록(오답만 복습 등록) + 실배점 채점 결과 저장 */
  finishMock: (args: {
    ids: string[];
    answers: Record<string, { selectedIndex: number; isCorrect: boolean }>;
    durationSec: number;
  }) => MockResult;
  /** 전체 데이터를 JSON 문자열로 내보내기 */
  exportBundle: () => string;
  /** JSON 백업 복원(성공 여부 반환) */
  importBundle: (text: string) => boolean;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `a_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  // 초기값은 상수(SSR/hydration 일관). 실제 값은 아래 effect에서 로드.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mocks, setMocks] = useState<MockResult[]>([]);

  useEffect(() => {
    // 시험일은 자동으로 채우지 않는다(가짜 D-day 방지). 사용자가 설정에서 지정.
    setSettings(repository.getSettings());
    setAttempts(repository.getAttempts());
    setReviews(repository.getReviews());
    setMocks(repository.getMocks());
    setReady(true);
  }, []);

  const saveSettings = useCallback((s: Settings) => {
    repository.saveSettings(s);
    setSettings(s);
  }, []);

  const submitAnswer: StoreValue["submitAnswer"] = useCallback(
    ({ questionId, selectedIndex, isCorrect, confidence }) => {
      const now = new Date();
      const attempt: Attempt = {
        id: genId(),
        questionId,
        selectedIndex,
        isCorrect,
        confidence,
        answeredAt: now.toISOString(),
      };
      repository.addAttempt(attempt);

      // 복습 스케줄 갱신 (확신도 반영 SRS)
      const existing = repository.getReview(questionId);
      const nextReview = nextReviewOnAnswer(
        questionId,
        existing,
        isCorrect,
        confidence,
        now
      );
      repository.upsertReview(questionId, nextReview);

      setAttempts(repository.getAttempts());
      setReviews(repository.getReviews());
    },
    []
  );

  const finishMock: StoreValue["finishMock"] = useCallback(
    ({ ids, answers, durationSec }) => {
      const now = new Date();
      const correctById: Record<string, boolean> = {};
      for (const id of ids) {
        const a = answers[id];
        correctById[id] = a?.isCorrect === true; // 미응답은 오답 처리
        if (!a) continue;
        // 모의고사 답안도 기록(source: mock). 확신도 통계는 mock 제외.
        repository.addAttempt({
          id: genId(),
          questionId: id,
          selectedIndex: a.selectedIndex,
          isCorrect: a.isCorrect,
          confidence: "unsure",
          answeredAt: now.toISOString(),
          source: "mock",
        });
        // 복습은 '틀린' 문항만 등록(정답 문항까지 복습망에 넣지 않음)
        if (!a.isCorrect) {
          const existing = repository.getReview(id);
          repository.upsertReview(
            id,
            existing
              ? nextReviewOnAnswer(id, existing, false, "unsure", now)
              : scheduleOnWrong(id, now)
          );
        }
      }
      const graded = scoreMock({
        questions: QUESTIONS,
        ids,
        correctById,
        durationSec,
      });
      const result: MockResult = {
        id: genId(),
        takenAt: now.toISOString(),
        ...graded,
      };
      repository.addMock(result);

      setAttempts(repository.getAttempts());
      setReviews(repository.getReviews());
      setMocks(repository.getMocks());
      return result;
    },
    []
  );

  const exportBundle = useCallback(
    () => JSON.stringify(repository.exportBundle(), null, 2),
    []
  );

  const importBundle = useCallback((text: string) => {
    try {
      const ok = repository.importBundle(JSON.parse(text));
      if (ok) {
        setAttempts(repository.getAttempts());
        setReviews(repository.getReviews());
        setMocks(repository.getMocks());
        setSettings(repository.getSettings());
      }
      return ok;
    } catch {
      return false;
    }
  }, []);

  const resetAll = useCallback(() => {
    // 학습 기록만 초기화. 시험일·목표 등 설정은 보존한다.
    repository.resetProgress();
    setAttempts([]);
    setReviews([]);
    setMocks([]);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      settings,
      attempts,
      reviews,
      mocks,
      saveSettings,
      submitAnswer,
      finishMock,
      exportBundle,
      importBundle,
      resetAll,
    }),
    [
      ready,
      settings,
      attempts,
      reviews,
      mocks,
      saveSettings,
      submitAnswer,
      finishMock,
      exportBundle,
      importBundle,
      resetAll,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const questions = QUESTIONS;
