"use client";

import { useMemo } from "react";
import { questions, useStore } from "@/lib/store";
import {
  accuracyByCategoryWith,
  accuracyBySubject,
  confidenceBreakdown,
  estimateScore,
} from "@/lib/scoring";
import {
  CATEGORY_LABEL,
  CONFIDENCE_LABEL,
  type Category,
  type Confidence,
} from "@/lib/types";

export default function StatsPage() {
  const { ready, attempts } = useStore();

  const score = useMemo(() => estimateScore(attempts, questions), [attempts]);
  const bySub = useMemo(
    () => accuracyBySubject(attempts, questions),
    [attempts]
  );
  const byCat = useMemo(
    () => accuracyByCategoryWith(attempts, questions),
    [attempts]
  );
  const conf = useMemo(() => confidenceBreakdown(attempts), [attempts]);

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  const catOrder: Category[] = [
    "modeling_basics",
    "modeling_performance",
    "sql_basics",
    "sql_advanced",
    "sql_management",
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-slate-900">통계</h1>
        <p className="text-sm text-slate-500">총 {attempts.length}회 풀이 기록</p>
      </header>

      {/* 예상점수 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">예상 점수</p>
          {!score.enoughSample && (
            <span className="chip bg-accent-100 text-accent-ink">표본 부족</span>
          )}
        </div>
        <p className="mt-1 text-4xl font-black text-brand-700">
          {score.total}
          <span className="ml-1 text-base font-normal text-slate-400">
            / 100
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          데이터모델링 {score.dataModeling}/20 · SQL {score.sql}/80
        </p>
      </div>

      {/* 과목별 */}
      <div className="card">
        <p className="mb-3 text-sm font-bold text-slate-500">과목별 정답률</p>
        <Bar
          label="데이터 모델링"
          rate={bySub.data_modeling.rate}
          total={bySub.data_modeling.total}
          correct={bySub.data_modeling.correct}
        />
        <Bar
          label="SQL 기본 및 활용"
          rate={bySub.sql.rate}
          total={bySub.sql.total}
          correct={bySub.sql.correct}
        />
      </div>

      {/* 유형별 */}
      <div className="card">
        <p className="mb-3 text-sm font-bold text-slate-500">유형별 정답률</p>
        {catOrder.every((c) => !byCat[c]) ? (
          <p className="text-sm text-slate-400">아직 데이터가 없어요.</p>
        ) : (
          catOrder.map((c) => {
            const a = byCat[c];
            if (!a) return null;
            return (
              <Bar
                key={c}
                label={CATEGORY_LABEL[c]}
                rate={a.rate}
                total={a.total}
                correct={a.correct}
              />
            );
          })
        )}
      </div>

      {/* 확신도 */}
      <div className="card">
        <p className="mb-3 text-sm font-bold text-slate-500">확신도별 정답률</p>
        {(["sure", "unsure", "guess"] as Confidence[]).map((c) => {
          const b = conf[c];
          const rate = b.total ? b.correct / b.total : 0;
          return (
            <Bar
              key={c}
              label={CONFIDENCE_LABEL[c]}
              rate={rate}
              total={b.total}
              correct={b.correct}
            />
          );
        })}
        <p className="mt-2 text-xs text-slate-400">
          &lsquo;찍음&rsquo; 정답률이 높다면 운에 의존 중일 수 있어요.
          &lsquo;확실함&rsquo; 정답률이 낮다면 잘못 아는 개념이 있는지 점검하세요.
        </p>
      </div>
    </div>
  );
}

function Bar({
  label,
  rate,
  total,
  correct,
}: {
  label: string;
  rate: number;
  total: number;
  correct: number;
}) {
  const pct = Math.round(rate * 100);
  const color =
    total === 0
      ? "bg-slate-200"
      : pct >= 70
        ? "bg-brand-500"
        : pct >= 40
          ? "bg-accent-400"
          : "bg-rose-400";
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-700">
          {total === 0 ? "-" : `${pct}%`}
          <span className="ml-1 text-slate-400">
            ({correct}/{total})
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
