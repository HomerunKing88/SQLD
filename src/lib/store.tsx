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
import { repository } from "./repository";
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
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `a_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** 최초 진입 시 시험일이 없으면 30일 뒤로 기본 설정 */
function ensureExamDate(s: Settings): Settings {
  if (s.examDate) return s;
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return { ...s, examDate: d.toISOString().slice(0, 10) };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(repository.getSettings());
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mocks, setMocks] = useState<MockResult[]>([]);

  useEffect(() => {
    const s = ensureExamDate(repository.getSettings());
    repository.saveSettings(s);
    setSettings(s);
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

  const resetAll = useCallback(() => {
    repository.reset();
    const s = ensureExamDate(repository.getSettings());
    repository.saveSettings(s);
    setSettings(s);
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
