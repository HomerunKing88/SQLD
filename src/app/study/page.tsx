"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { questions, useStore } from "@/lib/store";
import { buildTodaySet } from "@/lib/session";
import QuestionCard from "@/components/QuestionCard";
import type { Confidence } from "@/lib/types";
import { estimateScore } from "@/lib/scoring";

interface Result {
  questionId: string;
  isCorrect: boolean;
  confidence: Confidence;
}

export default function StudyPage() {
  const { ready, settings, attempts, reviews, submitAnswer } = useStore();
  const qMap = useMemo(() => new Map(questions.map((q) => [q.id, q])), []);

  // 세션 문제 세트는 최초 1회만 구성 (풀이 중 재구성 방지)
  const frozen = useRef<string[] | null>(null);
  if (frozen.current === null && ready) {
    frozen.current = buildTodaySet({
      questions,
      attempts,
      reviews,
      settings,
    }).questionIds;
  }
  const dueSet = useRef<Set<string> | null>(null);
  if (dueSet.current === null && ready) {
    dueSet.current = new Set(
      reviews
        .filter((r) => new Date(r.dueAt).getTime() <= Date.now())
        .map((r) => r.questionId)
    );
  }

  const [cursor, setCursor] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  if (!ready || frozen.current === null) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  const ids = frozen.current;

  if (ids.length === 0) {
    return (
      <Empty message="오늘 풀 문제가 없어요. 설정에서 하루 목표를 늘리거나 데이터를 초기화해보세요." />
    );
  }

  // 세션 완료
  if (cursor >= ids.length) {
    return <Summary results={results} />;
  }

  const q = qMap.get(ids[cursor]);
  if (!q) {
    // 안전장치: 알 수 없는 문제는 건너뛴다 (버튼으로 다음 진행)
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">문제를 불러올 수 없습니다.</p>
        <button
          className="btn-ghost mt-4 inline-flex"
          onClick={() => setCursor((c) => c + 1)}
        >
          다음
        </button>
      </div>
    );
  }

  return (
    <QuestionCard
      key={q.id}
      question={q}
      index={cursor}
      total={ids.length}
      isReview={dueSet.current?.has(q.id)}
      isLast={cursor === ids.length - 1}
      onAnswered={(r) => {
        submitAnswer({
          questionId: q.id,
          selectedIndex: r.selectedIndex,
          isCorrect: r.isCorrect,
          confidence: r.confidence,
        });
        setResults((prev) => [
          ...prev,
          { questionId: q.id, isCorrect: r.isCorrect, confidence: r.confidence },
        ]);
      }}
      onNext={() => setCursor((c) => c + 1)}
    />
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
      <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-center text-white shadow">
        <p className="text-sm opacity-80">오늘 학습 완료 🎉</p>
        <p className="mt-2 text-5xl font-black">{rate}%</p>
        <p className="mt-1 text-sm opacity-80">
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
        <p className="mt-1 text-3xl font-black text-slate-900">
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
