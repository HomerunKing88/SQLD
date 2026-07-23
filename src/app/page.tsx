"use client";

import Link from "next/link";
import { useMemo } from "react";
import { questions, useStore } from "@/lib/store";
import { daysUntil, ddayLabel } from "@/lib/dday";
import { buildTodaySet } from "@/lib/session";
import { estimateScore, accuracyBySubject } from "@/lib/scoring";
import { dueReviewIds } from "@/lib/srs";

export default function HomePage() {
  const { ready, settings, attempts, reviews } = useStore();

  const dday = daysUntil(settings.examDate);
  const today = useMemo(
    () => buildTodaySet({ questions, attempts, reviews, settings }),
    [attempts, reviews, settings]
  );
  const score = useMemo(() => estimateScore(attempts, questions), [attempts]);
  const bySub = useMemo(
    () => accuracyBySubject(attempts, questions),
    [attempts]
  );
  const dueCount = dueReviewIds(reviews).length;

  if (!ready) return <Loading />;

  const passProjected = score.total >= 60;

  return (
    <div className="space-y-3">
      {/* D-day 히어로 — 녹색, 포인트는 노란 밑줄 */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card">
        <p className="text-xs font-medium text-brand-100">시험까지</p>
        <p className="mt-1 inline-block text-4xl font-black tracking-tight">
          {ddayLabel(dday)}
          <span className="mt-1 block h-1 w-12 rounded-full bg-accent-400" />
        </p>
        <p className="mt-2 text-xs text-brand-100">
          {settings.examDate || "설정에서 시험일을 정하세요"}
        </p>
      </div>

      {/* 예상 점수 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">예상 점수</p>
          {!score.enoughSample && (
            <span className="chip bg-accent-100 text-accent-ink">표본 부족</span>
          )}
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-black text-brand-700">
            {score.total}
          </span>
          <span className="mb-1 text-sm text-slate-400">/ 100 (합격 60)</span>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <ScoreRow label="데이터 모델링" value={score.dataModeling} max={20} />
          <ScoreRow label="SQL 기본 및 활용" value={score.sql} max={80} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {passProjected
            ? "🎯 현재 페이스면 합격권입니다. 유지!"
            : `합격까지 ${60 - score.total}점 더 필요해요. SQL 정답률을 끌어올리세요.`}
        </p>
      </div>

      {/* 오늘의 학습 CTA */}
      <div className="card">
        <p className="text-sm font-bold text-slate-500">오늘의 학습</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">
            {today.questionIds.length}
          </span>
          <span className="text-sm text-slate-400">문제</span>
          {today.reviewCount > 0 && (
            <span className="chip ml-auto bg-accent-100 text-accent-ink">
              복습 {today.reviewCount}
            </span>
          )}
        </div>
        <Link href="/study" className="btn-primary mt-3 w-full">
          오늘의 학습 시작
        </Link>
      </div>

      {/* 영역별 정답률 요약 */}
      <div className="card">
        <p className="mb-2 text-sm font-bold text-slate-500">영역별 정답률</p>
        <AccRow
          label="데이터 모델링"
          rate={bySub.data_modeling.rate}
          total={bySub.data_modeling.total}
        />
        <AccRow
          label="SQL 기본 및 활용"
          rate={bySub.sql.rate}
          total={bySub.sql.total}
        />
      </div>

      {/* 복습 대기 — 흰 카드 + 노란 포인트 */}
      {dueCount > 0 && (
        <Link
          href="/review"
          className="flex items-center gap-3 rounded-2xl border border-accent-200 bg-white p-4 shadow-card"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-100 text-lg">
            🔁
          </span>
          <span className="text-sm font-semibold text-slate-700">
            복습 대기 {dueCount}문제
          </span>
          <span className="ml-auto text-accent-500">→</span>
        </Link>
      )}
    </div>
  );
}

function ScoreRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-brand-500"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function AccRow({
  label,
  rate,
  total,
}: {
  label: string;
  rate: number;
  total: number;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">
          {total === 0 ? "-" : `${Math.round(rate * 100)}%`}
          <span className="ml-1 text-slate-400">({total})</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-brand-500"
          style={{ width: `${rate * 100}%` }}
        />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400">
      불러오는 중…
    </div>
  );
}
