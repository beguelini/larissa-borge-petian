create table public.member_accounts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique check (email = lower(email) and char_length(email) between 5 and 254),
  password_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.member_accounts enable row level security;
revoke all on table public.member_accounts from anon, authenticated;
grant select, insert, update, delete on table public.member_accounts to service_role;
