create table if not exists public.bug_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid null references auth.users (id) on delete set null,
    email text null,
    kind text not null default 'bug', -- 'bug' | 'suggestion'
    page text null,
    message text not null,
    created_at timestamptz default now()
);

alter table public.bug_reports enable row level security;

drop policy if exists "Authenticated can submit bug reports" on public.bug_reports;
create policy "Authenticated can submit bug reports"
on public.bug_reports
for insert
to authenticated
with check (true);

