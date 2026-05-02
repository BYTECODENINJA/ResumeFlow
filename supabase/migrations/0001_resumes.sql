-- Run in Supabase SQL Editor (or supabase db push) if you do not already have this table.
-- Adjust only if your schema already differs.

create table if not exists public.resumes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    data jsonb not null default '{}'::jsonb,
    theme_id text not null default 'deep-ocean',
    template text not null default 'modern',
    layout text not null default 'modern',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists resumes_user_updated_idx on public.resumes (user_id, updated_at desc);

-- If the table already existed without layout, add the column:
alter table public.resumes add column if not exists layout text not null default 'modern';

alter table public.resumes enable row level security;

drop policy if exists "Users can read own resumes" on public.resumes;
drop policy if exists "Users can insert own resumes" on public.resumes;
drop policy if exists "Users can update own resumes" on public.resumes;
drop policy if exists "Users can delete own resumes" on public.resumes;

create policy "Users can read own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);
