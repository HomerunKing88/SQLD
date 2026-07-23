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
  const score = useMemo(
    () => estimateScore(attempts, questions),
    [attempts]
  );
  const bySub = useMemo(
    () => accuracyBySubject(attempts, questions),
    [attempts]
  );
  const dueCount = dueReviewIds(reviews).length;

  if (!ready) return <Loading />;

  const passProjected = score.total >= 60;

  return (
    <div className="space-y-4">
      {/* D-day 히어로 */}
      <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow">
        <p className="text-xs opacity-80">시험까지</p>
        <p className="mt-1 text-4xl font-black tracking-tight">
          {ddayLabel(dday)}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {settings.examDate || "설정에서 시험일을 정하세요"}
        </p>
      </div>

      {/* 예상 점수 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">예상 점수</p>
          {!score.enoughSample && (
            <span className="chip bg-amber-100 text-amber-700">표본 부족</span>
          )}
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span
            className={`text-4xl font-black ${
              passProjected ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {score.total}
          </span>
          <span className="mb-1 text-sm text-slate-400">/ 100 (합격 60)</span>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <ScoreRow
            label="데이터 모델링"
            value={score.dataModeling}
            max={20}
            color="bg-violet-500"
          />
          <ScoreRow
            label="SQL 기본 및 활용"
            value={score.sql}
            max={80}
            color="bg-brand"
          />
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
          <span className="text-2xl font-black text-slate-900">
            {today.questionIds.length}
          </span>
          <span className="text-sm text-slate-400">문제</span>
          {today.reviewCount > 0 && (
            <span className="chip bg-violet-100 text-violet-700">
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

      {dueCount > 0 && (
        <Link
          href="/review"
          className="flex items-center justify-between rounded-2xl bg-violet-600 p-4 text-white shadow-sm"
        >
          <span className="text-sm font-semibold">
            🔁 복습 대기 {dueCount}문제
          </span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}

function ScoreRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
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
          className={`h-full ${color}`}
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
          className="h-full bg-emerald-500"
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
