"use client";

import { useMemo, useState } from "react";
import { CONCEPTS } from "@/data/concepts";
import { CATEGORY_LABEL, type Category } from "@/lib/types";

const CAT_ORDER: Category[] = [
  "modeling_basics",
  "modeling_performance",
  "sql_basics",
  "sql_advanced",
  "sql_management",
];

/** 시험 직전 빠르게 훑는 핵심 요약 시트(치트시트). 검색 + 접기. */
export default function ConceptSheet() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const kw = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!kw) return CONCEPTS;
    return CONCEPTS.filter((c) =>
      [c.title, c.summary, c.trap ?? "", c.example ?? "", c.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(kw)
    );
  }, [kw]);

  const grouped = useMemo(
    () =>
      CAT_ORDER.map((cat) => ({
        cat,
        items: filtered.filter((c) => c.category === cat),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );

  return (
    <div className="flex flex-1 flex-col">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="개념·키워드 검색 (예: ROWNUM, 정규화)"
        className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800"
      />

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          &lsquo;{q}&rsquo; 검색 결과가 없어요.
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <div key={g.cat}>
              <p className="mb-2 text-xs font-bold text-slate-500">
                {CATEGORY_LABEL[g.cat]}{" "}
                <span className="text-slate-400">({g.items.length})</span>
              </p>
              <ul className="space-y-2">
                {g.items.map((c) => {
                  const isOpen = open === c.id;
                  return (
                    <li
                      key={c.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : c.id)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                      >
                        <span className="text-sm font-bold text-slate-800">
                          {c.title}
                        </span>
                        <span className="flex-none text-slate-400">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="space-y-2 px-3 pb-3">
                          <p className="text-sm leading-relaxed text-slate-700">
                            {c.summary}
                          </p>
                          {c.trap && (
                            <p className="rounded-lg bg-accent-100/50 p-2 text-xs leading-relaxed text-slate-700">
                              ⚠️ {c.trap}
                            </p>
                          )}
                          {c.example && (
                            <p className="rounded-lg bg-slate-50 p-2 font-mono text-[12px] leading-relaxed text-slate-600">
                              {c.example}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
