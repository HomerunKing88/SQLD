"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Attempt, Confidence, Review, Settings } from "./types";
import { repository } from "./repository";
import { advanceReview, scheduleOnWrong } from "./srs";
import { QUESTIONS } from "@/data/questions";

interface StoreValue {
  ready: boolean;
  settings: Settings;
  attempts: Attempt[];
  reviews: Review[];
  saveSettings: (s: Settings) => void;
  /** 채점 처리: attempt 저장 + 복습 스케줄 갱신 */
  submitAnswer: (args: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    confidence: Confidence;
  }) => void;
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

  useEffect(() => {
    const s = ensureExamDate(repository.getSettings());
    repository.saveSettings(s);
    setSettings(s);
    setAttempts(repository.getAttempts());
    setReviews(repository.getReviews());
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

      // 복습 스케줄 갱신
      const existing = repository.getReview(questionId);
      let nextReview: Review | null;
      if (isCorrect) {
        nextReview = existing ? advanceReview(existing, true, now) : null;
      } else {
        nextReview = existing
          ? advanceReview(existing, false, now)
          : scheduleOnWrong(questionId, now);
      }
      repository.upsertReview(questionId, nextReview);

      setAttempts(repository.getAttempts());
      setReviews(repository.getReviews());
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
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      settings,
      attempts,
      reviews,
      saveSettings,
      submitAnswer,
      resetAll,
    }),
    [ready, settings, attempts, reviews, saveSettings, submitAnswer, resetAll]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const questions = QUESTIONS;
