"use client";

import { useMemo, useState } from "react";
import { OX_ITEMS } from "@/data/ox";
import { CATEGORY_LABEL } from "@/lib/types";
import type { OxItem } from "@/lib/types";
import type { ConceptGroup } from "@/lib/cards";

const GROUPS: { key: ConceptGroup; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "sql", label: "SQL" },
  { key: "modeling", label: "데이터모델링" },
];

function groupOf(o: OxItem): Exclude<ConceptGroup, "all"> {
  return o.category.startsWith("modeling") ? "modeling" : "sql";
}

export default function OxQuiz() {
  const [group, setGroup] = useState<ConceptGroup>("all");
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);

  const items = useMemo(
    () => OX_ITEMS.filter((o) => group === "all" || groupOf(o) === group),
    [group]
  );

  const item = items[pos];
  const done = pos >= items.length;
  const answered = picked !== null;
  const isCorrect = answered && item && picked === item.answer;

  function changeGroup(g: ConceptGroup) {
    setGroup(g);
    setPos(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
    setRound((r) => r + 1);
  }
  function pick(v: boolean) {
    if (answered || !item) return;
    setPicked(v);
    setScore((s) => ({
      correct: s.correct + (v === item.answer ? 1 : 0),
      total: s.total + 1,
    }));
  }
  function next() {
    setPicked(null);
    setPos((p) => p + 1);
  }
  function restart() {
    setPos(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
    setRound((r) => r + 1);
  }

  return (
    <div key={round} className="flex flex-1 flex-col">
      <div className="mb-3 flex gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => changeGroup(g.key)}
            className={`chip ${
              group === g.key
                ? "bg-brand-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          맞춤 {score.correct}/{score.total}
        </span>
        <span className="font-semibold text-brand-600">
          {Math.min(done ? items.length : pos + 1, items.length)}/{items.length}
        </span>
      </div>

      {done ? (
        <div className="card flex flex-1 flex-col items-center justify-center py-10 text-center">
          <span className="text-4xl">
            {score.total && score.correct / score.total >= 0.8 ? "🏆" : "📌"}
          </span>
          <p className="mt-3 text-lg font-black text-slate-900">
            {score.correct} / {score.total} 정답
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {score.total
              ? `정답률 ${Math.round((score.correct / score.total) * 100)}%`
              : ""}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            틀린 함정은 다시 돌려서 확실히 각인하세요.
          </p>
          <button onClick={restart} className="btn-primary mt-5 w-full max-w-xs">
            다시 풀기
          </button>
        </div>
      ) : (
        item && (
          <>
            <div className="card flex-1">
              <span className="chip bg-brand-50 text-brand-700">
                {CATEGORY_LABEL[item.category]}
              </span>
              <p className="mt-3 text-[15px] font-bold leading-relaxed text-slate-900">
                {item.statement}
              </p>

              {answered && (
                <div
                  className={`mt-4 rounded-xl p-3 ${
                    isCorrect
                      ? "bg-brand-50 text-brand-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <p className="text-sm font-bold">
                    {isCorrect ? "정답! " : "오답 · "}
                    정답은{" "}
                    <span className="underline">
                      {item.answer ? "O (옳다)" : "X (그르다)"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {item.explain}
                  </p>
                </div>
              )}
            </div>

            {!answered ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => pick(true)}
                  className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-brand-50 text-2xl font-black text-brand-700 active:scale-[0.98] active:bg-brand-100"
                >
                  ⭕ <span className="text-base">옳다</span>
                </button>
                <button
                  onClick={() => pick(false)}
                  className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-rose-50 text-2xl font-black text-rose-600 active:scale-[0.98] active:bg-rose-100"
                >
                  ❌ <span className="text-base">그르다</span>
                </button>
              </div>
            ) : (
              <button className="btn-primary mt-3 w-full" onClick={next}>
                {pos === items.length - 1 ? "결과 보기" : "다음"}
              </button>
            )}
          </>
        )
      )}
    </div>
  );
}
