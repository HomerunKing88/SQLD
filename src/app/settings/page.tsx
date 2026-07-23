"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { ready, settings, saveSettings, resetAll } = useStore();
  const [examDate, setExamDate] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [sqlWeight, setSqlWeight] = useState(70);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) {
      setExamDate(settings.examDate);
      setDailyGoal(settings.dailyGoal);
      setSqlWeight(Math.round(settings.sqlWeight * 100));
    }
  }, [ready, settings]);

  if (!ready) {
    return <div className="py-10 text-center text-slate-400">불러오는 중…</div>;
  }

  function handleSave() {
    saveSettings({
      examDate,
      dailyGoal: Math.min(25, Math.max(5, dailyGoal)),
      sqlWeight: Math.min(1, Math.max(0, sqlWeight / 100)),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-slate-900">설정</h1>
      </header>

      <div className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            시험일 (D-day)
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            하루 목표 문제 수: {dailyGoal}
          </label>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <p className="text-xs text-slate-400">권장 15~25 (출퇴근 20~30분)</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            SQL 문제 비중: {sqlWeight}%
          </label>
          <input
            type="range"
            min={30}
            max={90}
            step={5}
            value={sqlWeight}
            onChange={(e) => setSqlWeight(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <p className="text-xs text-slate-400">
            SQL 과목 보강이 목표라면 70% 이상 권장
          </p>
        </div>

        <button className="btn-primary w-full" onClick={handleSave}>
          {saved ? "저장됨 ✓" : "저장"}
        </button>
      </div>

      <div className="card">
        <p className="text-sm font-semibold text-slate-700">데이터 관리</p>
        <p className="mt-1 text-xs text-slate-400">
          모든 풀이 기록·복습·설정은 이 기기에만 저장됩니다.
        </p>
        <button
          className="btn-ghost mt-3 w-full text-rose-600"
          onClick={() => {
            if (confirm("모든 학습 기록을 삭제할까요? 되돌릴 수 없습니다.")) {
              resetAll();
            }
          }}
        >
          학습 기록 초기화
        </button>
      </div>
    </div>
  );
}
