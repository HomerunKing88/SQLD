"use client";

import Link from "next/link";
import { useMemo } from "react";
import { questions, useStore } from "@/lib/store";
import { daysUntil, ddayLabel } from "@/lib/dday";
import { buildTodaySet } from "@/lib/session";
import { estimateScore, accuracyByCategoryWith } from "@/lib/scoring";
import { dueReviewIds } from "@/lib/srs";
import { dailyProgress } from "@/lib/streak";
import { CATEGORY_LABEL, type Category } from "@/lib/types";
import { sessionForDate } from "@/data/examSchedule";

export default function HomePage() {
  const { ready, settings, attempts, reviews, mocks } = useStore();
  const lastMock = mocks.length ? mocks[mocks.length - 1] : null;

  const dday = daysUntil(settings.examDate);
  const gichulCount = useMemo(
    () => questions.filter((q) => q.tags.includes("기출유형")).length,
    []
  );
  const today = useMemo(
    () => buildTodaySet({ questions, attempts, reviews, settings }),
    [attempts, reviews, settings]
  );
  const score = useMemo(() => estimateScore(attempts, questions), [attempts]);
  const dueCount = dueReviewIds(reviews).length;
  const daily = useMemo(
    () => dailyProgress(attempts, settings.dailyGoal),
    [attempts, settings.dailyGoal]
  );
  // 가장 취약한 유형(정답률 최저, 표본 있는 것 중) — 특훈 진입점에 표시
  const weakest = useMemo(() => {
    const byCat = accuracyByCategoryWith(attempts, questions);
    let pick: { cat: Category; rate: number } | null = null;
    (Object.keys(byCat) as Category[]).forEach((c) => {
      const a = byCat[c];
      if (!a || a.total === 0) return;
      if (!pick || a.rate < pick.rate) pick = { cat: c, rate: a.rate };
    });
    return pick as { cat: Category; rate: number } | null;
  }, [attempts]);

  if (!ready) return <Loading />;

  const passProjected = score.total >= 60;
  const hasData = attempts.length > 0;

  return (
    <div className="space-y-3">
      {/* D-day 히어로 (시험일 미설정 시 설정 유도) */}
      {dday === null ? (
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card"
        >
          <span className="text-3xl">📅</span>
          <div>
            <p className="text-base font-black">시험일을 설정하세요</p>
            <p className="mt-0.5 text-xs text-brand-100">
              D-day와 학습 계획을 위해 필요해요 →
            </p>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-brand-100">
                시험까지
                {sessionForDate(settings.examDate) &&
                  ` · ${sessionForDate(settings.examDate)!.label}`}
              </p>
              <p className="mt-1 inline-block text-4xl font-black tracking-tight">
                {ddayLabel(dday)}
                <span className="mt-1 block h-1 w-12 rounded-full bg-accent-400" />
              </p>
            </div>
            {daily.streak > 0 && (
              <span className="chip bg-accent-400 text-accent-ink">
                🔥 {daily.streak}일 연속
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-brand-100">{settings.examDate}</p>
        </div>
      )}

      {/* 오늘의 학습 — 주요 액션(상단 배치, 엄지 도달) */}
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">오늘의 학습</p>
          {today.reviewCount > 0 && (
            <span className="chip bg-accent-100 text-accent-ink">
              복습 {today.reviewCount}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">
            {daily.done}
          </span>
          <span className="text-sm text-slate-400">/ {daily.goal} 문제</span>
          {daily.reached && (
            <span className="ml-auto text-sm font-bold text-brand-600">
              목표 달성 🎉
            </span>
          )}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full ${daily.reached ? "bg-brand-500" : "bg-accent-400"}`}
            style={{ width: `${daily.ratio * 100}%` }}
          />
        </div>
        <Link
          href="/study"
          className={`mt-3 w-full ${daily.reached ? "btn-accent" : "btn-primary"}`}
        >
          {daily.reached
            ? "복습 더 하기"
            : daily.done > 0
              ? "이어서 학습하기"
              : "오늘의 학습 시작"}
        </Link>
      </div>

      {/* 예상 점수 — 압축 스트립(데이터 있을 때만, 상세는 통계 탭) */}
      {hasData ? (
        <Link
          href="/stats"
          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card"
        >
          <div>
            <p className="text-xs font-bold text-slate-500">예상 점수</p>
            <p className="mt-0.5">
              <span
                className={`text-2xl font-black ${passProjected ? "text-brand-700" : "text-slate-800"}`}
              >
                {score.total}
              </span>
              <span className="text-xs text-slate-400"> / 100 (합격 60)</span>
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs">
            {!score.enoughSample && (
              <span className="chip bg-accent-100 text-accent-ink">
                더 풀면 정확해져요
              </span>
            )}
            <span className="font-semibold text-brand-500">통계 →</span>
          </span>
        </Link>
      ) : (
        <div className="card text-center text-sm text-slate-500">
          문제를 풀면 예상 점수를 계산해 드려요. 위 <b>오늘의 학습</b>부터
          시작해보세요! 💪
        </div>
      )}

      {/* 연습 모드 — 모의고사 / 특훈 / 기출 통합 */}
      <div className="card">
        <p className="mb-2 text-sm font-bold text-slate-500">연습 모드</p>
        <div className="space-y-2">
          <ModeRow
            href="/exam"
            icon="📝"
            title="모의고사"
            sub={
              lastMock
                ? `최근 ${lastMock.score}점 · ${lastMock.passed ? "합격권" : "재도전"}`
                : "실제 배점으로 실력 점검"
            }
            right={
              lastMock ? (
                <span
                  className={`text-lg font-black ${lastMock.passed ? "text-brand-600" : "text-slate-400"}`}
                >
                  {lastMock.score}
                </span>
              ) : undefined
            }
          />
          <ModeRow
            href="/study?mode=drill"
            icon="🎯"
            title="취약 유형 특훈"
            sub={
              weakest
                ? `${CATEGORY_LABEL[weakest.cat]} ${Math.round(weakest.rate * 100)}% — 집중 공략`
                : "정답률 낮은 유형을 몰아서 연습"
            }
          />
          <ModeRow
            href="/study?mode=gichul"
            icon="📜"
            title="기출 유형"
            sub={`빈출 개념·함정 ${gichulCount}문항`}
          />
        </div>
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

function ModeRow({
  href,
  icon,
  title,
  sub,
  right,
}: {
  href: string;
  icon: string;
  title: string;
  sub: string;
  right?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 active:bg-slate-50"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-50 text-lg"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="truncate text-xs text-slate-400">{sub}</p>
      </div>
      <span className="ml-auto">
        {right ?? <span className="text-brand-500">→</span>}
      </span>
    </Link>
  );
}

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400">
      불러오는 중…
    </div>
  );
}
