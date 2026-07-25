"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import Flashcards from "@/components/concept/Flashcards";
import OxQuiz from "@/components/concept/OxQuiz";
import ConceptSheet from "@/components/concept/ConceptSheet";

type Mode = "cards" | "ox" | "sheet";

const TABS: { key: Mode; icon: string; label: string }[] = [
  { key: "cards", icon: "🃏", label: "플래시카드" },
  { key: "ox", icon: "⭕", label: "O/X 퀴즈" },
  { key: "sheet", icon: "📋", label: "요약 시트" },
];

const HINT: Record<Mode, string> = {
  cards: "탭해서 뒤집고, 아래 버튼으로 채점 — 반복 각인",
  ox: "함정 진술을 옳다/그르다로 판정 — 능동 회상",
  sheet: "전 개념을 검색·훑어보기 — 시험 직전 총정리",
};

export default function ConceptHubPage() {
  const { ready } = useStore();
  const [mode, setMode] = useState<Mode>("cards");

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900">개념 암기</h1>
          <Link href="/" className="text-sm font-semibold text-slate-400">
            닫기
          </Link>
        </div>
        <p className="text-sm text-slate-500">{HINT[mode]}</p>
      </header>

      {/* 모드 전환 세그먼트 */}
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
              mode === t.key
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "cards" && <Flashcards />}
      {mode === "ox" && <OxQuiz />}
      {mode === "sheet" && <ConceptSheet />}
    </div>
  );
}
