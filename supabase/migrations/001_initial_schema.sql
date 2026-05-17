-- ─── Enable UUID extension ───────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── SUBJECTS ────────────────────────────────────────────────────────
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  name_kz text not null,
  name_ru text not null,
  icon text not null,
  color text not null,
  "order" integer not null default 0,
  is_active boolean not null default true
);

-- ─── TOPICS ──────────────────────────────────────────────────────────
create table topics (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references subjects(id) on delete cascade,
  name_kz text not null,
  description_kz text not null default '',
  video_url text,
  "order" integer not null default 0,
  is_active boolean not null default true
);

-- ─── QUESTIONS ───────────────────────────────────────────────────────
create table questions (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid not null references topics(id) on delete cascade,
  question_kz text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A','B','C','D')),
  difficulty text not null check (difficulty in ('easy','medium','hard')) default 'medium',
  is_active boolean not null default true
);

-- ─── USER PROFILES ───────────────────────────────────────────────────
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  city text not null default '',
  school text not null default '',
  grade integer not null check (grade in (9, 10, 11)),
  goal_score integer not null default 80 check (goal_score between 50 and 140),
  selected_subjects text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ─── USER PROGRESS ───────────────────────────────────────────────────
create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  is_completed boolean not null default false,
  best_score integer not null default 0,
  attempts integer not null default 0,
  last_attempt_at timestamptz not null default now(),
  unique(user_id, topic_id)
);

-- ─── USER ANSWERS ─────────────────────────────────────────────────────
create table user_answers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_option text not null check (selected_option in ('A','B','C','D')),
  is_correct boolean not null,
  ai_explanation text,
  answered_at timestamptz not null default now()
);

-- ─── STREAKS ─────────────────────────────────────────────────────────
create table streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date not null default current_date
);

-- ─── XP LOGS ─────────────────────────────────────────────────────────
create table xp_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- ─── UBT RESULTS ─────────────────────────────────────────────────────
create table ubt_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_score integer not null default 0,
  subject_scores jsonb not null default '[]',
  time_spent integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────
create index on topics(subject_id);
create index on questions(topic_id);
create index on user_progress(user_id);
create index on user_answers(user_id, question_id);
create index on xp_logs(user_id);
create index on ubt_results(user_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────
alter table subjects enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table user_profiles enable row level security;
alter table user_progress enable row level security;
alter table user_answers enable row level security;
alter table streaks enable row level security;
alter table xp_logs enable row level security;
alter table ubt_results enable row level security;

-- subjects и topics — читают все авторизованные пользователи
create policy "subjects read" on subjects for select to authenticated using (true);
create policy "topics read" on topics for select to authenticated using (true);
create policy "questions read" on questions for select to authenticated using (true);

-- user_profiles — только своя запись
create policy "profiles read own" on user_profiles for select to authenticated using (auth.uid() = id);
create policy "profiles insert own" on user_profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on user_profiles for update to authenticated using (auth.uid() = id);

-- user_progress — только своя запись
create policy "progress read own" on user_progress for select to authenticated using (auth.uid() = user_id);
create policy "progress insert own" on user_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress update own" on user_progress for update to authenticated using (auth.uid() = user_id);

-- user_answers — только своя запись
create policy "answers read own" on user_answers for select to authenticated using (auth.uid() = user_id);
create policy "answers insert own" on user_answers for insert to authenticated with check (auth.uid() = user_id);

-- streaks — только своя запись
create policy "streaks read own" on streaks for select to authenticated using (auth.uid() = user_id);
create policy "streaks insert own" on streaks for insert to authenticated with check (auth.uid() = user_id);
create policy "streaks update own" on streaks for update to authenticated using (auth.uid() = user_id);

-- xp_logs — только своя запись
create policy "xp read own" on xp_logs for select to authenticated using (auth.uid() = user_id);
create policy "xp insert own" on xp_logs for insert to authenticated with check (auth.uid() = user_id);

-- ubt_results — только своя запись
create policy "ubt read own" on ubt_results for select to authenticated using (auth.uid() = user_id);
create policy "ubt insert own" on ubt_results for insert to authenticated with check (auth.uid() = user_id);

-- ─── SEED DATA: Subjects ──────────────────────────────────────────────
insert into subjects (name_kz, name_ru, icon, color, "order") values
  ('Математика',    'Математика',          '📐', '#2D6A4F', 1),
  ('Физика',        'Физика',              '⚛️', '#3A86FF', 2),
  ('Қазақ тілі',   'Казахский язык',      '📝', '#E76F51', 3),
  ('Тарих',         'История',             '🏛️', '#F4A261', 4),
  ('Биология',      'Биология',            '🧬', '#52B788', 5),
  ('Химия',         'Химия',               '🧪', '#9B5DE5', 6),
  ('Ағылшын тілі', 'Английский язык',     '🇬🇧', '#00BBF9', 7),
  ('Информатика',   'Информатика',         '💻', '#4361EE', 8),
  ('География',     'География',           '🌍', '#06D6A0', 9);
