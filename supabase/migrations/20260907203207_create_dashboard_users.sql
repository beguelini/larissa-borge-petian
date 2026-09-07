create table public.dashboard_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9._-]{3,40}$'),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.dashboard_users is
  'Contas administrativas do painel da Larissa Petian. Senhas são armazenadas somente como hash scrypt.';

alter table public.dashboard_users enable row level security;
revoke all on table public.dashboard_users from anon, authenticated;
grant select, insert, update, delete on table public.dashboard_users to service_role;
