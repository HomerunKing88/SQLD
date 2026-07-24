"use client";

import { useMemo, useState } from "react";
import { questions, useStore } from "@/lib/store";
import { latestAttempts } from "@/lib/scoring";
import { REVIEW_INTERVALS_DAYS } from "@/lib/srs";
import {
  CATEGORY_LABEL,
  type Confidence,
  type Question,
} from "@/lib/types";
import QuestionCard from "@/components/QuestionCard";

export default function ReviewPage() {
  const { ready, attempts, reviews, submitAnswer } = useStore();
  const qMap = useMemo(() => new Map(questions.map((q) => [q.id, q])), []);
  const [practice, setPractice] = useState<Question[] | null>(null);
  const [cursor, setCursor] = useState(0);

  const now = Date.now();

  const { dueList, laterList } = useMemo(() => {
    const latest = latestAttempts(attempts);
    // 오답노트: 최신 결과가 오답이거나, 복습 스케줄이 걸린 문제
    const reviewMap = new Map(reviews.map((r) => [r.questionId, r]));
    const ids = new Set<string>([
      ...[...latest.values()].filter((a) => !a.isCorrect).map((a) => a.questionId),
      ...reviews.map((r) => r.questionId),
    ]);
    const items = [...ids]
      .map((id) => ({ q: qMap.get(id), review: reviewMap.get(id) }))
      .filter((x): x is { q: Question; review: (typeof reviews)[number] | undefined } =>
        Boolean(x.q)
      );
    const due = items.filter(
      (x) => x.review && new Date(x.review.dueAt).getTime() <= now
    );
    const later = items.filter(
      (x) => !x.review || new Date(x.review.dueAt).getTime() > now
    );
    return { dueList: due, laterList: later };
  }, [attempts, reviews, qMap, now]);

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  // 복습 풀이 모드
  if (practice) {
    if (cursor >= practice.length) {
      return (
        <div className="py-16 text-center">
          <p className="text-lg font-bold text-slate-800">복습 완료! 🔁</p>
          <p className="mt-2 text-sm text-slate-500">
            맞힌 문제는 다음 간격({REVIEW_INTERVALS_DAYS.join("→")}일)으로,
            <br />
            틀린 문제는 1일 뒤 다시 나옵니다.
          </p>
          <button
            className="btn-primary mt-4"
            onClick={() => {
              setPractice(null);
              setCursor(0);
            }}
          >
            오답노트로 돌아가기
          </button>
        </div>
      );
    }
    const q = practice[cursor];
    return (
      <QuestionCard
        key={q.id}
        question={q}
        index={cursor}
        total={practice.length}
        isReview
        isLast={cursor === practice.length - 1}
        onAnswered={(r) =>
          submitAnswer({
            questionId: q.id,
            selectedIndex: r.selectedIndex,
            isCorrect: r.isCorrect,
            confidence: r.confidence as Confidence,
          })
        }
        onNext={() => setCursor((c) => c + 1)}
      />
    );
  }

  const totalWrong = dueList.length + laterList.length;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-slate-900">오답노트</h1>
        <p className="text-sm text-slate-500">
          틀린 문제를 1·3·7일 간격으로 다시 풀어요.
        </p>
      </header>

      {totalWrong === 0 && (
        <div className="card text-center text-sm text-slate-500">
          아직 오답이 없어요. 학습을 시작해보세요! 💪
        </div>
      )}

      {dueList.length > 0 && (
        <div className="card border-2 border-accent-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-accent-ink">
              <span>🔁</span> 지금 복습할 문제 {dueList.length}
            </p>
          </div>
          <ul className="space-y-1">
            {dueList.map(({ q }) => (
              <ReviewItem key={q.id} q={q} />
            ))}
          </ul>
          <button
            className="btn-primary mt-3 w-full"
            onClick={() => {
              setPractice(dueList.map((x) => x.q));
              setCursor(0);
            }}
          >
            복습 {dueList.length}문제 풀기
          </button>
        </div>
      )}

      {laterList.length > 0 && (
        <div className="card">
          <p className="mb-2 text-sm font-bold text-slate-500">
            예정된 복습 {laterList.length}
          </p>
          <ul className="space-y-1">
            {laterList.map(({ q, review }) => (
              <ReviewItem
                key={q.id}
                q={q}
                due={
                  review
                    ? new Date(review.dueAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })
                    : undefined
                }
              />
            ))}
          </ul>
          <button
            className="btn-ghost mt-3 w-full"
            onClick={() => {
              setPractice(laterList.map((x) => x.q));
              setCursor(0);
            }}
          >
            미리 다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ q, due }: { q: Question; due?: string }) {
  return (
    <li className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">{q.stem}</p>
        <p className="text-xs text-slate-400">{CATEGORY_LABEL[q.category]}</p>
      </div>
      {due && (
        <span className="chip flex-none bg-slate-200 text-slate-600">{due}</span>
      )}
    </li>
  );
}
