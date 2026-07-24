"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { questions, useStore } from "@/lib/store";
import {
  buildMockExam,
  DEFAULT_MOCK,
  formatClock,
  formatDuration,
  mockTimeLimitSec,
} from "@/lib/mock";
import {
  CATEGORY_LABEL,
  SUBJECT_LABEL,
  type MockResult,
} from "@/lib/types";

type Phase = "intro" | "exam" | "result";

const EXAM_KEY = "sqld.exam";

interface ExamState {
  ids: string[];
  selected: Record<string, number>; // qid -> 선택 보기 index
  cursor: number;
  startedAt: number; // ms
}

function loadExam(): ExamState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(EXAM_KEY);
    return raw ? (JSON.parse(raw) as ExamState) : null;
  } catch {
    return null;
  }
}
function saveExam(s: ExamState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(EXAM_KEY, JSON.stringify(s));
}
function clearExam() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(EXAM_KEY);
}

export default function ExamPage() {
  const { ready, finishMock } = useStore();
  const qMap = useMemo(() => new Map(questions.map((q) => [q.id, q])), []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [exam, setExam] = useState<ExamState | null>(null);
  const [result, setResult] = useState<MockResult | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const inited = useRef(false);
  const submittedRef = useRef(false);

  // 진행 중 시험 복원
  useEffect(() => {
    if (!ready || inited.current) return;
    inited.current = true;
    const saved = loadExam();
    if (
      saved &&
      Array.isArray(saved.ids) &&
      saved.ids.length > 0 &&
      typeof saved.cursor === "number" &&
      saved.cursor >= 0 &&
      saved.cursor < saved.ids.length &&
      saved.selected != null &&
      saved.ids.every((id) => qMap.has(id))
    ) {
      setExam(saved);
      setPhase("exam");
    } else {
      clearExam();
    }
  }, [ready, qMap]);

  // 타이머 tick
  useEffect(() => {
    if (phase !== "exam") return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const limitSec = exam ? mockTimeLimitSec(exam.ids.length) : 0;
  const elapsedSec = exam ? Math.floor((nowMs - exam.startedAt) / 1000) : 0;
  const remainingSec = Math.max(0, limitSec - elapsedSec);

  const submit = useCallback(() => {
    if (!exam || submittedRef.current) return;
    submittedRef.current = true;
    const durationSec = Math.min(
      limitSec,
      Math.floor((Date.now() - exam.startedAt) / 1000)
    );
    const answers: Record<string, { selectedIndex: number; isCorrect: boolean }> =
      {};
    for (const id of exam.ids) {
      const sel = exam.selected[id];
      if (sel === undefined) continue;
      const q = qMap.get(id);
      if (!q) continue;
      answers[id] = { selectedIndex: sel, isCorrect: sel === q.answerIndex };
    }
    const r = finishMock({ ids: exam.ids, answers, durationSec });
    clearExam();
    setResult(r);
    setPhase("result");
  }, [exam, limitSec, qMap, finishMock]);

  // 시간 종료 시 자동 제출
  useEffect(() => {
    if (phase === "exam" && exam && remainingSec <= 0) submit();
  }, [phase, exam, remainingSec, submit]);

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  // ── 결과 화면 ──
  if (phase === "result" && result) {
    return <ResultView result={result} />;
  }

  // ── 시작 화면 ──
  if (phase === "intro" || !exam) {
    // 구성은 결정적으로 계산(렌더에서 Math.random 사용 금지). 셔플은 시작 시에만.
    const dmAvail = questions.filter(
      (q) => q.subject === "data_modeling"
    ).length;
    const sqlAvail = questions.filter((q) => q.subject === "sql").length;
    const dm = Math.min(DEFAULT_MOCK.modeling, dmAvail);
    const count = dm + Math.min(DEFAULT_MOCK.sql, sqlAvail);
    const start = () => {
      const ids = buildMockExam(questions);
      const s: ExamState = { ids, selected: {}, cursor: 0, startedAt: Date.now() };
      submittedRef.current = false;
      setExam(s);
      saveExam(s);
      setNowMs(Date.now());
      setPhase("exam");
    };
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-black text-slate-900">모의고사</h1>
          <p className="text-sm text-slate-500">실제 배점으로 실력을 점검하세요.</p>
        </header>
        <div className="card space-y-3">
          <Row label="문항 수" value={`${count}문항 (모델링 ${dm} · SQL ${count - dm})`} />
          <Row label="제한 시간" value={formatDuration(mockTimeLimitSec(count))} />
          <Row label="배점" value="데이터모델링 20 · SQL 80 (합격 60)" />
          <Row label="채점" value="제출 후 일괄 채점 (풀이 중 정답 비공개)" />
          <p className="rounded-xl bg-accent-50 p-3 text-xs text-accent-ink">
            ⏱ 풀이 중에는 확신도·해설 없이 실제 시험처럼 진행됩니다. 시간이 끝나면
            자동 제출되고, 틀린 문항은 오답노트·복습에 자동 반영됩니다.
          </p>
          <button className="btn-primary w-full" onClick={start}>
            모의고사 시작
          </button>
          <Link href="/" className="btn-ghost w-full">
            취소
          </Link>
        </div>
      </div>
    );
  }

  // ── 시험 진행 화면 ──
  const total = exam.ids.length;
  const q = qMap.get(exam.ids[exam.cursor])!;
  const selected = exam.selected[q.id];
  const answeredCount = Object.keys(exam.selected).length;
  const isLast = exam.cursor === total - 1;
  const timeLow = remainingSec <= 60;

  const update = (patch: Partial<ExamState>) => {
    setExam((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveExam(next);
      return next;
    });
  };
  const pick = (i: number) =>
    update({ selected: { ...exam.selected, [q.id]: i } });
  const go = (d: number) =>
    update({ cursor: Math.min(total - 1, Math.max(0, exam.cursor + d)) });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* 상단: 타이머 + 진행 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {exam.cursor + 1} / {total} · 응답 {answeredCount}
        </span>
        <span
          className={`chip font-mono font-bold ${
            timeLow ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-700"
          }`}
        >
          ⏱ {formatClock(remainingSec)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${((exam.cursor + 1) / total) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <div className="mt-4 flex-1">
        <div className="card">
          <p className="mb-1 text-xs font-semibold text-brand-600">
            {SUBJECT_LABEL[q.subject]} · {CATEGORY_LABEL[q.category]}
          </p>
          <p className="whitespace-pre-wrap text-[15px] font-semibold leading-relaxed text-slate-900">
            {q.stem}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {q.choices.map((c, i) => {
            const chosen = selected === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${
                  chosen
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
                }`}
              >
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border text-xs font-bold">
                  {["①", "②", "③", "④", "⑤"][i] ?? i + 1}
                </span>
                <span className="flex-1 leading-relaxed">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 고정: 네비 + 제출 */}
      <div className="safe-bottom sticky bottom-16 -mx-4 mt-4 space-y-2 border-t border-slate-200/70 bg-canvas/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-ghost"
            disabled={exam.cursor === 0}
            onClick={() => go(-1)}
          >
            이전
          </button>
          {isLast ? (
            <button
              className="btn-accent"
              onClick={() => {
                if (
                  confirm(
                    `제출하시겠어요? (응답 ${answeredCount}/${total})\n미응답은 오답 처리됩니다.`
                  )
                )
                  submit();
              }}
            >
              제출하기
            </button>
          ) : (
            <button className="btn-primary" onClick={() => go(1)}>
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: MockResult }) {
  const failReason =
    !result.passed && result.score >= 60 ? "과목 과락(40% 미만)" : null;
  return (
    <div className="space-y-4 py-2">
      <div
        className={`rounded-2xl p-6 text-center text-white shadow-card ${
          result.passed
            ? "bg-gradient-to-br from-brand-600 to-brand-800"
            : "bg-gradient-to-br from-slate-600 to-slate-800"
        }`}
      >
        <p className="text-sm opacity-90">
          {result.passed ? "합격권입니다! 🎉" : "조금 더 필요해요"}
        </p>
        <p className="mt-2 text-5xl font-black">
          {result.score}
          <span className="text-2xl"> / 100</span>
        </p>
        <p className="mt-1 text-sm opacity-90">
          {result.passed ? "합격 기준 60점 달성" : `합격까지 ${Math.max(0, 60 - result.score)}점`}
        </p>
      </div>

      <div className="card space-y-2">
        <ScoreLine label="데이터 모델링" value={result.dataModeling} max={20} />
        <ScoreLine label="SQL 기본 및 활용" value={result.sql} max={80} />
        {failReason && (
          <p className="rounded-lg bg-rose-50 p-2 text-xs font-semibold text-rose-600">
            ⚠ 총점은 60 이상이지만 {failReason}으로 불합격 처리됩니다.
          </p>
        )}
      </div>

      <div className="card grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-xs text-slate-400">정답</p>
          <p className="text-xl font-black text-slate-800">
            {result.correct} / {result.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">소요 시간</p>
          <p className="text-xl font-black text-slate-800">
            {formatDuration(result.durationSec)}
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        틀린 문항은 오답노트·복습(1·3·7일)에 자동 반영되었습니다.
      </p>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function ScoreLine({
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
      <div className="mb-1 flex justify-between text-xs">
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
