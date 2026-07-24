-- SQLD 30일 앱 — 선택적 Supabase 스키마
-- 기본 앱은 localStorage로 동작합니다. 클라우드 동기화가 필요할 때만 사용하세요.
-- Supabase SQL Editor 에 붙여넣어 실행하면 됩니다.

-- 문제 원본
create table if not exists public.questions (
  id            text primary key,
  subject       text not null check (subject in ('data_modeling','sql')),
  category      text not null check (category in
                  ('modeling_basics','modeling_performance',
                   'sql_basics','sql_advanced','sql_management')),
  difficulty    int  not null default 1 check (difficulty between 1 and 3),
  stem          text not null,
  choices       jsonb not null,        -- string[]
  answer_index  int  not null,
  explanation   text not null,
  sql_steps     jsonb,                 -- { query, steps: [...] } (nullable)
  tags          jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- 풀이 기록 (오답노트·통계·예상점수의 원천)
create table if not exists public.attempts (
  id             uuid primary key default gen_random_uuid(),
  question_id    text not null references public.questions(id) on delete cascade,
  selected_index int  not null,
  is_correct     boolean not null,
  confidence     text not null check (confidence in ('sure','unsure','guess')),
  source         text not null default 'study' check (source in ('study','mock')),
  answered_at    timestamptz not null default now()
);
create index if not exists attempts_question_idx on public.attempts(question_id);
create index if not exists attempts_answered_idx on public.attempts(answered_at);
create index if not exists attempts_source_idx on public.attempts(source);

-- 모의고사 결과 이력
create table if not exists public.mock_results (
  id            uuid primary key default gen_random_uuid(),
  taken_at      timestamptz not null default now(),
  total         int  not null,
  correct       int  not null,
  data_modeling int  not null,   -- 0~20
  sql           int  not null,   -- 0~80
  score         int  not null,   -- 0~100
  duration_sec  int  not null,
  passed        boolean not null
);
create index if not exists mock_results_taken_idx on public.mock_results(taken_at);

-- 간격 반복 복습 스케줄 (문제당 1행)
create table if not exists public.reviews (
  question_id text primary key references public.questions(id) on delete cascade,
  stage       int not null default 0,         -- 0->1일, 1->3일, 2->7일, 3->졸업
  due_at      timestamptz not null,
  updated_at  timestamptz not null default now()
);
create index if not exists reviews_due_idx on public.reviews(due_at);

-- 사용자 설정 (1인 개인용이므로 단일 행)
create table if not exists public.settings (
  id          int primary key default 1 check (id = 1),
  exam_date   date,
  daily_goal  int not null default 20,
  sql_weight  numeric not null default 0.7
);

-- 참고: 1인 개인용이라 인증 없이 사용 가정. 여러 기기/공개 배포 시에는
-- RLS를 활성화하고 auth.uid() 기반 정책과 user_id 컬럼을 추가하세요.
