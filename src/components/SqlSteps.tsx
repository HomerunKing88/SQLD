"use client";

import { useState } from "react";
import type { SqlSteps as SqlStepsType, SqlStepTable } from "@/lib/types";

function Table({ table }: { table: SqlStepTable }) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th
                key={c}
                className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-600"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border border-slate-200 px-2 py-1 text-slate-700"
                >
                  {cell === null ? (
                    <span className="italic text-slate-400">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SqlSteps({ steps }: { steps: SqlStepsType }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-3">
      <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100 overflow-x-auto">
        {steps.query}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        논리적 실행 순서대로 각 단계 결과를 확인하세요. (탭하여 펼치기)
      </p>
      <ol className="mt-2 space-y-2">
        {steps.steps.map((s, idx) => {
          const isOpen = open === idx;
          return (
            <li
              key={idx}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <button
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-2 bg-slate-50 px-3 py-2 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="chip bg-brand-100 text-brand-700">
                    {idx + 1}. {s.clause}
                  </span>
                </span>
                <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1">
                  <p className="text-sm text-slate-600">{s.desc}</p>
                  <Table table={s.table} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
