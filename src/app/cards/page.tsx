"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CONCEPTS } from "@/data/concepts";
import { buildCardDeck, deckSummary, type ConceptGroup } from "@/lib/cards";
import { CATEGORY_LABEL, type CardRating } from "@/lib/types";

const GROUPS: { key: ConceptGroup; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "sql", label: "SQL" },
  { key: "modeling", label: "데이터모델링" },
];

export default function CardsPage() {
  const { ready, cardProgress, markCard } = useStore();
  const [group, setGroup] = useState<ConceptGroup>("all");
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // 이번 세션에서 방금 채점한 카드는 덱 재정렬이 튀지 않도록 순서를 고정한다.
  const [deckKey, setDeckKey] = useState(0);

  // 덱은 그룹/진행 스냅샷 기준으로 계산(세션 중 정렬 고정). deckKey로 명시적 재구성.
  const deck = useMemo(
    () => buildCardDeck(CONCEPTS, cardProgress, group),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, deckKey]
  );
  const summary = useMemo(
    () => deckSummary(CONCEPTS, cardProgress, group),
    [cardProgress, group]
  );

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  const card = deck[pos];
  const done = pos >= deck.length;

  function changeGroup(g: ConceptGroup) {
    setGroup(g);
    setPos(0);
    setFlipped(false);
    setDeckKey((k) => k + 1);
  }

  function rate(rating: CardRating) {
    if (!card) return;
    markCard(card.id, rating);
    setFlipped(false);
    setPos((p) => p + 1);
  }

  function restart() {
    setPos(0);
    setFlipped(false);
    setDeckKey((k) => k + 1);
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* 헤더 */}
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900">빈출 개념 카드</h1>
          <Link href="/" className="text-sm font-semibold text-slate-400">
            닫기
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          이동 중 한 손으로 — 탭해서 뒤집고, 아래 버튼으로 채점하세요.
        </p>
      </header>

      {/* 그룹 필터 */}
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

      {/* 진행 바 */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>
            숙지 {summary.known} · 학습중 {summary.learning} · 새 카드{" "}
            {summary.unseen}
          </span>
          <span className="font-semibold text-brand-600">
            {done ? deck.length : Math.min(pos + 1, deck.length)}/{deck.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{
              width: `${
                deck.length ? (Math.min(pos, deck.length) / deck.length) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {done ? (
        <DeckDone
          mastered={summary.known}
          total={summary.total}
          onRestart={restart}
        />
      ) : (
        card && (
          <>
            {/* 카드(탭하여 뒤집기) */}
            <button
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "앞면 보기" : "뒷면(정답·해설) 보기"}
              className="card flex flex-1 flex-col text-left active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="chip bg-brand-50 text-brand-700">
                  {CATEGORY_LABEL[card.category]}
                </span>
                <span className="text-xs text-slate-400">
                  {flipped ? "핵심·함정·예제" : "탭하면 뒤집혀요"}
                </span>
              </div>

              {!flipped ? (
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                  <p className="text-lg font-black text-slate-900">
                    {card.title}
                  </p>
                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                    {card.front}
                  </p>
                  <p className="mt-6 text-xs text-slate-400">👆 탭하여 확인</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3 py-4">
                  <p className="text-base font-bold text-slate-900">
                    {card.title}
                  </p>
                  <div>
                    <p className="text-xs font-bold text-brand-600">핵심</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
                      {card.summary}
                    </p>
                  </div>
                  {card.trap && (
                    <div className="rounded-xl bg-accent-100/60 p-3">
                      <p className="text-xs font-bold text-accent-ink">
                        ⚠️ 함정
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
                        {card.trap}
                      </p>
                    </div>
                  )}
                  {card.example && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">예제</p>
                      <p className="mt-0.5 font-mono text-[13px] leading-relaxed text-slate-700">
                        {card.example}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </button>

            {/* 자가채점(엄지 위치·하단 고정) */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <RateBtn
                label="다시"
                sub="몰랐어요"
                cls="bg-rose-50 text-rose-600 active:bg-rose-100"
                onClick={() => rate("again")}
              />
              <RateBtn
                label="애매"
                sub="가물가물"
                cls="bg-accent-100 text-accent-ink active:bg-accent-200"
                onClick={() => rate("ok")}
              />
              <RateBtn
                label="알아요"
                sub="확실함"
                cls="bg-brand-50 text-brand-700 active:bg-brand-100"
                onClick={() => rate("known")}
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              &lsquo;다시&rsquo;로 표시한 카드가 먼저 다시 나와요.
            </p>
          </>
        )
      )}
    </div>
  );
}

function RateBtn({
  label,
  sub,
  cls,
  onClick,
}: {
  label: string;
  sub: string;
  cls: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[60px] flex-col items-center justify-center rounded-xl font-bold transition active:scale-[0.98] ${cls}`}
    >
      <span className="text-sm">{label}</span>
      <span className="text-[11px] font-medium opacity-70">{sub}</span>
    </button>
  );
}

function DeckDone({
  mastered,
  total,
  onRestart,
}: {
  mastered: number;
  total: number;
  onRestart: () => void;
}) {
  return (
    <div className="card flex flex-1 flex-col items-center justify-center py-10 text-center">
      <span className="text-4xl">🎉</span>
      <p className="mt-3 text-lg font-black text-slate-900">한 바퀴 완료!</p>
      <p className="mt-1 text-sm text-slate-500">
        숙지한 개념 {mastered}/{total}개
      </p>
      <p className="mt-1 text-xs text-slate-400">
        &lsquo;다시/애매&rsquo; 카드를 한 번 더 돌리면 더 오래 기억돼요.
      </p>
      <button onClick={onRestart} className="btn-primary mt-5 w-full max-w-xs">
        다시 한 바퀴
      </button>
      <Link href="/" className="mt-2 text-sm font-semibold text-slate-500">
        홈으로
      </Link>
    </div>
  );
}
