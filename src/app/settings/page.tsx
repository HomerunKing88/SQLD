"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import ConfirmModal from "@/components/ConfirmModal";
import { SQLD_EXAMS } from "@/data/examSchedule";
import { daysUntil, ddayLabel } from "@/lib/dday";

export default function SettingsPage() {
  const { ready, settings, saveSettings, resetAll, exportBundle, importBundle } =
    useStore();
  const [examDate, setExamDate] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [sqlWeight, setSqlWeight] = useState(70);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function handleExport() {
    const blob = new Blob([exportBundle()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sqld-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("백업 파일을 내보냈어요");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBundle(String(reader.result ?? ""));
      flash(ok ? "복원 완료 🎉" : "복원 실패: 올바른 백업 파일이 아니에요");
    };
    reader.readAsText(file);
  }

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

  // 회차 선택 시 즉시 반영(시험일 저장)
  function pickSession(date: string) {
    setExamDate(date);
    saveSettings({
      examDate: date,
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            시험 회차 선택 (2026 SQLD)
          </label>
          <div className="space-y-2">
            {SQLD_EXAMS.map((s) => {
              const dday = daysUntil(s.date);
              const past = dday !== null && dday < 0;
              const selected = examDate === s.date;
              return (
                <button
                  key={s.round}
                  onClick={() => pickSession(s.date)}
                  disabled={past}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white active:bg-slate-50"
                  } ${past ? "opacity-40" : ""}`}
                >
                  <span>
                    <span className="text-sm font-bold text-slate-800">
                      {s.label}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">{s.date}</span>
                  </span>
                  <span
                    className={`chip ${
                      selected
                        ? "bg-brand-500 text-white"
                        : past
                          ? "bg-slate-100 text-slate-400"
                          : "bg-accent-100 text-accent-ink"
                    }`}
                  >
                    {past ? "종료" : ddayLabel(dday)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            회차를 고르면 시험일이 자동 설정됩니다. (접수는 통상 시험 4~5주 전)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            직접 입력 (다른 연도·재시험 등)
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
          모든 기록은 이 기기에만 저장됩니다. 기기 변경·브라우저 초기화에 대비해
          주기적으로 백업하세요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={handleExport}>
            백업 내보내기
          </button>
          <button
            className="btn-ghost"
            onClick={() => fileRef.current?.click()}
          >
            가져오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        {toast && (
          <p className="mt-2 rounded-lg bg-brand-50 p-2 text-center text-xs font-semibold text-brand-700">
            {toast}
          </p>
        )}
        <button
          className="btn-ghost mt-2 w-full text-rose-600"
          onClick={() => setConfirmReset(true)}
        >
          학습 기록 초기화
        </button>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="학습 기록을 초기화할까요?"
        message="풀이·복습·모의고사 기록이 삭제됩니다. (시험일·설정은 유지) 되돌릴 수 없습니다."
        confirmLabel="초기화"
        cancelLabel="취소"
        tone="danger"
        onConfirm={() => {
          setConfirmReset(false);
          resetAll();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
