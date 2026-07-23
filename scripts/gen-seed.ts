// questions.ts 를 단일 원본으로 삼아 Supabase seed.sql 을 생성한다.
// 실행: npx tsx scripts/gen-seed.ts
import { writeFileSync } from "node:fs";
import { QUESTIONS } from "../src/data/questions.ts";

function q(v: unknown): string {
  return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
}
function s(v: string): string {
  return "'" + v.replace(/'/g, "''") + "'";
}

const rows = QUESTIONS.map((it) => {
  const sqlSteps = it.sqlSteps ? q(it.sqlSteps) : "null";
  return `  (${s(it.id)}, ${s(it.subject)}, ${s(it.category)}, ${it.difficulty}, ${s(
    it.stem
  )}, ${q(it.choices)}::jsonb, ${it.answerIndex}, ${s(
    it.explanation
  )}, ${sqlSteps}::jsonb, ${q(it.tags)}::jsonb)`;
}).join(",\n");

const sql = `-- 자동 생성 파일 — 수정하지 마세요. src/data/questions.ts 를 고친 뒤
-- \`npx tsx scripts/gen-seed.ts\` 로 다시 생성하세요.
insert into public.questions
  (id, subject, category, difficulty, stem, choices, answer_index, explanation, sql_steps, tags)
values
${rows}
on conflict (id) do update set
  subject = excluded.subject,
  category = excluded.category,
  difficulty = excluded.difficulty,
  stem = excluded.stem,
  choices = excluded.choices,
  answer_index = excluded.answer_index,
  explanation = excluded.explanation,
  sql_steps = excluded.sql_steps,
  tags = excluded.tags;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`wrote supabase/seed.sql (${QUESTIONS.length} questions)`);
