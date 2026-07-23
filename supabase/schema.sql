-- SQLD 30-day coach: run in Supabase SQL editor
create table profiles (id uuid primary key references auth.users on delete cascade, exam_date date not null, created_at timestamptz default now());
create table questions (id bigint generated always as identity primary key, area text not null check (area in ('데이터 모델링','SQL 기본 및 활용')), question_type text not null, prompt text not null, choices jsonb not null, answer_index int not null, explanation text not null, sql_text text, stages jsonb, active boolean default true);
create table attempts (id bigint generated always as identity primary key, user_id uuid references profiles(id) on delete cascade, question_id bigint references questions(id), selected_index int not null, confidence text not null check (confidence in ('확실함','애매함','찍음')), is_correct boolean not null, attempted_at timestamptz default now());
create table review_queue (id bigint generated always as identity primary key, user_id uuid references profiles(id) on delete cascade, question_id bigint references questions(id), due_at timestamptz not null, interval_days int not null check (interval_days in (1,3,7)), unique(user_id, question_id, interval_days));
alter table profiles enable row level security; alter table attempts enable row level security; alter table review_queue enable row level security;
create policy "own profile" on profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "own attempts" on attempts for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own reviews" on review_queue for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
