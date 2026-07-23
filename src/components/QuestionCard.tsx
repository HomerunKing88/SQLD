"use client";

import { useState } from "react";
import type { Confidence, Question } from "@/lib/types";
import {
  CATEGORY_LABEL,
  CONFIDENCE_LABEL,
  SUBJECT_LABEL,
} from "@/lib/types";
import SqlSteps from "./SqlSteps";

const CONF_STYLE: Record<Confidence, string> = {
  sure: "bg-brand-100 text-brand-700 border-brand-300",
  unsure: "bg-accent-100 text-accent-ink border-accent-300",
  guess: "bg-slate-100 text-slate-600 border-slate-300",
};

interface Props {
  question: Question;
  index: number;
  total: number;
  isReview?: boolean;
  onAnswered: (result: {
    selectedIndex: number;
    isCorrect: boolean;
    confidence: Confidence;
  }) => void;
  onNext: () => void;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  index,
  total,
  isReview,
  onAnswered,
  onNext,
  isLast,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === question.answerIndex;

  function handleSubmit() {
    if (selected === null || confidence === null) return;
    setSubmitted(true);
    onAnswered({
      selectedIndex: selected,
      isCorrect: selected === question.answerIndex,
      confidence,
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* 상단 진행 정보 */}
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          {index + 1} / {total}
        </span>
        <span className="flex items-center gap-1">
          {isReview && (
            <span className="chip bg-accent-100 text-accent-ink">복습</span>
          )}
          <span className="chip bg-slate-100 text-slate-600">
            {SUBJECT_LABEL[question.subject]}
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <div className="mt-4 flex-1">
        <div className="card">
          <p className="mb-1 text-xs font-semibold text-brand-600">
            {CATEGORY_LABEL[question.category]}
          </p>
          <p className="whitespace-pre-wrap text-[15px] font-semibold leading-relaxed text-slate-900">
            {question.stem}
          </p>
        </div>

        {/* 보기 */}
        <div className="mt-3 space-y-2">
          {question.choices.map((c, i) => {
            const chosen = selected === i;
            const correct = i === question.answerIndex;
            let cls =
              "border-slate-200 bg-white text-slate-700 active:bg-slate-50";
            if (submitted) {
              if (correct) cls = "border-brand-400 bg-brand-50 text-brand-800";
              else if (chosen) cls = "border-rose-300 bg-rose-50 text-rose-700";
              else cls = "border-slate-200 bg-white text-slate-400";
            } else if (chosen) {
              cls = "border-brand-500 bg-brand-50 text-brand-700";
            }
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(i)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${cls}`}
              >
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border text-xs font-bold">
                  {["①", "②", "③", "④", "⑤"][i] ?? i + 1}
                </span>
                <span className="flex-1 leading-relaxed">{c}</span>
                {submitted && correct && <span>✓</span>}
                {submitted && chosen && !correct && <span>✕</span>}
              </button>
            );
          })}
        </div>

        {/* 확신도 (제출 전) */}
        {!submitted && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">확신도</p>
            <div className="grid grid-cols-3 gap-2">
              {(["sure", "unsure", "guess"] as Confidence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setConfidence(c)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    confidence === c
                      ? CONF_STYLE[c]
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {CONFIDENCE_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 해설 (제출 후) */}
        {submitted && (
          <div className="mt-4">
            <div
              className={`rounded-xl p-3 text-sm font-semibold ${
                isCorrect
                  ? "bg-brand-50 text-brand-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {isCorrect ? "정답입니다! 🎉" : "오답입니다. 오답노트에 저장했어요."}
            </div>
            <div className="card mt-3">
              <p className="mb-1 text-xs font-bold text-slate-500">해설</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {question.explanation}
              </p>
            </div>
            {question.sqlSteps && (
              <div className="card mt-3">
                <p className="text-xs font-bold text-slate-500">
                  SQL 단계별 실행
                </p>
                <SqlSteps steps={question.sqlSteps} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 CTA */}
      <div className="safe-bottom sticky bottom-16 mt-4 bg-slate-100/0">
        {!submitted ? (
          <button
            className="btn-primary w-full"
            disabled={selected === null || confidence === null}
            onClick={handleSubmit}
          >
            {selected === null
              ? "보기를 선택하세요"
              : confidence === null
                ? "확신도를 선택하세요"
                : "정답 확인"}
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={onNext}>
            {isLast ? "세션 완료" : "다음 문제"}
          </button>
        )}
      </div>
    </div>
  );
}
