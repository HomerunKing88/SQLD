"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { questions, useStore } from "@/lib/store";
import { buildTodaySet, buildWeakDrillSet, buildTagSet } from "@/lib/session";
import QuestionCard from "@/components/QuestionCard";
import { CATEGORY_LABEL, type Confidence } from "@/lib/types";
import { estimateScore } from "@/lib/scoring";

interface Result {
  questionId: string;
  isCorrect: boolean;
  confidence: Confidence;
}

type Mode = "today" | "drill" | "gichul";
const GICHUL_TAG = "기출유형";

// 진행 중 세션을 localStorage에 보관 → 앱을 닫아도(통근 사이) 이어풀기
const SESSION_KEY = "sqld.session";

interface SavedSession {
  mode: Mode;
  ids: string[];
  cursor: number;
  // 문제별 답안 (재기록 방지 · 이어풀기 복원용)
  answers: Record<
    string,
    { selectedIndex: number; isCorrect: boolean; confidence: Confidence }
  >;
}

/** URL에 명시된 모드(?mode=drill|gichul)만 반환. 없으면 null(=진행 중 세션 우선). */
function urlMode(): Mode | null {
  if (typeof window === "undefined") return null;
  const m = new URLSearchParams(window.location.search).get("mode");
  return m === "drill" || m === "gichul" ? m : null;
}

function isValidSaved(saved: SavedSession | null, qMap: Map<string, unknown>): saved is SavedSession {
  return Boolean(
    saved &&
      Array.isArray(saved.ids) &&
      saved.ids.length > 0 &&
      saved.answers != null &&
      typeof saved.cursor === "number" &&
      saved.cursor >= 0 &&
      saved.cursor < saved.ids.length &&
      saved.ids.every((id) => qMap.has(id))
  );
}

function loadSession(): SavedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  } catch {
    return null;
  }
}
function saveSession(s: SavedSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* 저장 실패 무시 */
  }
}
function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export default function StudyPage() {
  const { ready, settings, attempts, reviews, submitAnswer } = useStore();
  const qMap = useMemo(() => new Map(questions.map((q) => [q.id, q])), []);

  const [session, setSession] = useState<SavedSession | null>(null);
  const dueRef = useRef<Set<string>>(new Set());
  const inited = useRef(false);

  // 최초 1회: 저장된 세션 복원 or 새로 구성
  useEffect(() => {
    if (!ready || inited.current) return;
    inited.current = true;
    dueRef.current = new Set(
      reviews
        .filter((r) => new Date(r.dueAt).getTime() <= Date.now())
        .map((r) => r.questionId)
    );
    const explicit = urlMode(); // 'drill' 또는 null
    const saved = loadSession();
    const savedValid = isValidSaved(saved, qMap);

    // 명시적 모드 진입(특훈/기출): 저장본이 같은 모드면 이어서, 아니면 새로 구성
    if (explicit === "drill" || explicit === "gichul") {
      if (savedValid && saved!.mode === explicit) {
        setSession(saved);
        return;
      }
      const ids =
        explicit === "drill"
          ? buildWeakDrillSet({ questions, attempts, settings }).questionIds
          : buildTagSet({ questions, attempts, settings }, GICHUL_TAG)
              .questionIds;
      const fresh: SavedSession = { mode: explicit, ids, cursor: 0, answers: {} };
      setSession(fresh);
      if (ids.length > 0) saveSession(fresh);
      return;
    }

    // 학습 탭(모드 미지정): 진행 중 세션이 있으면 모드 불문 이어풀기
    if (savedValid) {
      setSession(saved);
      return;
    }
    const ids = buildTodaySet({ questions, attempts, reviews, settings })
      .questionIds;
    const fresh: SavedSession = { mode: "today", ids, cursor: 0, answers: {} };
    setSession(fresh);
    if (ids.length > 0) saveSession(fresh);
  }, [ready, attempts, reviews, settings, qMap]);

  // 세션 변경 시 저장(완료되면 정리)
  useEffect(() => {
    if (!session) return;
    if (session.ids.length === 0) return;
    if (session.cursor >= session.ids.length) clearSession();
    else saveSession(session);
  }, [session]);

  if (!ready || session === null) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  const { ids, cursor, answers } = session;

  if (ids.length === 0) {
    return (
      <Empty message="오늘 풀 문제가 없어요. 설정에서 하루 목표를 늘리거나 데이터를 초기화해보세요." />
    );
  }

  // 세션 완료
  if (cursor >= ids.length) {
    const results: Result[] = ids
      .map((id) =>
        answers[id]
          ? {
              questionId: id,
              isCorrect: answers[id].isCorrect,
              confidence: answers[id].confidence,
            }
          : null
      )
      .filter((r): r is Result => r !== null);
    return <Summary results={results} />;
  }

  const q = qMap.get(ids[cursor]);
  if (!q) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">문제를 불러올 수 없습니다.</p>
        <button
          className="btn-ghost mt-4 inline-flex"
          onClick={() =>
            setSession((s) => (s ? { ...s, cursor: s.cursor + 1 } : s))
          }
        >
          다음
        </button>
      </div>
    );
  }

  const existing = answers[q.id];
  const focusCat = qMap.get(ids[0])?.category;

  return (
    <>
      {session.mode === "drill" && focusCat && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-ink">
          <span>🎯 취약 유형 특훈</span>
          <span className="chip bg-white text-slate-600">
            {CATEGORY_LABEL[focusCat]} 집중
          </span>
        </div>
      )}
      {session.mode === "gichul" && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
          <span>📜 기출 유형 집중</span>
          <span className="chip bg-white text-slate-600">
            자주 나오는 개념·함정
          </span>
        </div>
      )}
      <QuestionCard
        key={q.id}
        question={q}
        index={cursor}
        total={ids.length}
        isReview={dueRef.current.has(q.id)}
      isLast={cursor === ids.length - 1}
      initialAnswer={
        existing
          ? { selectedIndex: existing.selectedIndex, confidence: existing.confidence }
          : undefined
      }
      onAnswered={(r) => {
        // 이미 기록된 문제면 재기록하지 않음(이어풀기 복원 시 중복 방지)
        if (answers[q.id]) return;
        submitAnswer({
          questionId: q.id,
          selectedIndex: r.selectedIndex,
          isCorrect: r.isCorrect,
          confidence: r.confidence,
        });
        setSession((s) =>
          s
            ? {
                ...s,
                answers: {
                  ...s.answers,
                  [q.id]: {
                    selectedIndex: r.selectedIndex,
                    isCorrect: r.isCorrect,
                    confidence: r.confidence,
                  },
                },
              }
            : s
        );
      }}
      onNext={() =>
        setSession((s) => (s ? { ...s, cursor: s.cursor + 1 } : s))
      }
      />
    </>
  );
}

function Summary({ results }: { results: Result[] }) {
  const { attempts } = useStore();
  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const rate = total ? Math.round((correct / total) * 100) : 0;
  const score = estimateScore(attempts, questions);

  const luckyGuess = results.filter(
    (r) => r.confidence === "guess" && r.isCorrect
  ).length;
  const overconfident = results.filter(
    (r) => r.confidence === "sure" && !r.isCorrect
  ).length;

  return (
    <div className="space-y-4 py-4">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-center text-white shadow-card">
        <p className="text-sm text-brand-100">오늘 학습 완료 🎉</p>
        <p className="mt-2 text-5xl font-black">
          {rate}
          <span className="text-3xl">%</span>
        </p>
        <p className="mt-1 text-sm text-brand-100">
          {correct} / {total} 정답
        </p>
      </div>

      <div className="card">
        <p className="mb-2 text-sm font-bold text-slate-500">확신도 리뷰</p>
        <div className="space-y-1 text-sm text-slate-600">
          <p>🍀 찍었는데 맞은 문제: <b>{luckyGuess}</b>개 — 운에 기대지 말고 복습!</p>
          <p>⚠️ 확실했는데 틀린 문제: <b>{overconfident}</b>개 — 개념 재확인 필요.</p>
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-slate-500">갱신된 예상 점수</p>
        <p className="mt-1 text-3xl font-black text-brand-700">
          {score.total}
          <span className="ml-1 text-sm font-normal text-slate-400">
            / 100
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/review" className="btn-ghost">
          오답 복습하기
        </Link>
        <Link href="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      <Link href="/" className="btn-ghost mt-4 inline-flex">
        홈으로
      </Link>
    </div>
  );
}
