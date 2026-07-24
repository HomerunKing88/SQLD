"use client";

import { useMemo } from "react";
import { questions, useStore } from "@/lib/store";
import {
  accuracyByCategoryWith,
  accuracyBySubject,
  confidenceBreakdown,
  estimateScore,
  weakTags,
} from "@/lib/scoring";
import {
  CATEGORY_LABEL,
  CONFIDENCE_LABEL,
  type Category,
  type Confidence,
} from "@/lib/types";

export default function StatsPage() {
  const { ready, attempts, mocks } = useStore();

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
  const weak = useMemo(
    () => weakTags(attempts, questions, { minTotal: 1, limit: 8 }),
    [attempts]
  );

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
            <span className="chip bg-accent-100 text-accent-ink">
              몇 문제 더 풀면 정확해져요
            </span>
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

      {/* 모의고사 점수 추이 */}
      {mocks.length > 0 && (
        <div className="card">
          <p className="mb-1 text-sm font-bold text-slate-500">모의고사 추이</p>
          <p className="mb-3 text-xs text-slate-400">
            최근 {Math.min(mocks.length, 8)}회 · 합격선 60점
          </p>
          <div className="relative flex h-28 items-end gap-1.5">
            {/* 합격선(60점) */}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent-400"
              style={{ bottom: `${60}%` }}
            />
            {mocks.slice(-8).map((m) => (
              <div
                key={m.id}
                className="flex flex-1 flex-col items-center justify-end"
                title={`${m.score}점`}
              >
                <span className="mb-0.5 text-[10px] font-bold text-slate-500">
                  {m.score}
                </span>
                <div
                  className={`w-full rounded-t ${
                    m.passed ? "bg-brand-500" : "bg-slate-300"
                  }`}
                  style={{ height: `${Math.max(4, m.score)}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {mocks.length >= 2
              ? mocks[mocks.length - 1].score >= mocks[mocks.length - 2].score
                ? "📈 직전 회차보다 올랐어요. 좋은 흐름!"
                : "직전보다 소폭 하락 — 오답 복습으로 만회하세요."
              : "회차가 쌓이면 상승세를 확인할 수 있어요."}
          </p>
        </div>
      )}

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

      {/* 취약 개념 (태그별 드릴다운) */}
      {weak.length > 0 && (
        <div className="card">
          <p className="mb-1 text-sm font-bold text-slate-500">취약 개념 TOP</p>
          <p className="mb-3 text-xs text-slate-400">
            정답률이 낮은 세부 개념부터 다시 확인하세요.
          </p>
          <ul className="space-y-2">
            {weak.map((t) => {
              const pct = Math.round(t.rate * 100);
              const tone =
                pct >= 70
                  ? "bg-brand-500"
                  : pct >= 40
                    ? "bg-accent-400"
                    : "bg-rose-400";
              return (
                <li key={t.tag} className="flex items-center gap-2">
                  <span className="w-28 flex-none truncate text-xs font-medium text-slate-600">
                    #{t.tag}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${tone}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 flex-none text-right text-xs font-semibold text-slate-700">
                    {pct}%
                    <span className="ml-1 text-slate-400">
                      ({t.correct}/{t.total})
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
        <p className="mt-2 text-xs text-slate-500">{confidenceInsight(conf)}</p>
      </div>
    </div>
  );
}

/** 메타인지 코칭: 확신도 vs 실제 정답률 패턴에서 조언 도출 */
function confidenceInsight(conf: ReturnType<typeof confidenceBreakdown>): string {
  const sureRate = conf.sure.total ? conf.sure.correct / conf.sure.total : null;
  const guessRate = conf.guess.total
    ? conf.guess.correct / conf.guess.total
    : null;
  if (sureRate === null && guessRate === null) {
    return "확신도를 함께 기록하면, 아는 것과 찍은 것을 구분해 코칭해 드려요.";
  }
  if (sureRate !== null && sureRate < 0.8 && conf.sure.total >= 3) {
    return `⚠️ '확실함'인데 정답률이 ${Math.round(sureRate * 100)}%예요. 잘못 아는 개념이 있으니 해당 오답을 우선 복습하세요.`;
  }
  if (guessRate !== null && guessRate >= 0.5 && conf.guess.total >= 3) {
    return `🍀 '찍음' 정답률이 ${Math.round(guessRate * 100)}%로 높아요 — 운에 의존 중일 수 있으니, 찍어서 맞힌 문제도 복습에 포함돼요.`;
  }
  return "아는 문제(확실함)의 정답률을 높게 유지하고, 찍은 문제는 개념을 다시 확인하세요.";
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
