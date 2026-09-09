alter table public.member_accounts
  add column activation_token_hash text,
  add column activation_expires_at timestamptz,
  add column activated_at timestamptz;

create table public.hotmart_webhook_events (
  id uuid primary key default gen_random_uuid(),
  hotmart_event_id text not null unique,
  transaction_code text not null,
  event_type text not null,
  buyer_email text not null,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique (transaction_code, event_type)
);

alter table public.hotmart_webhook_events enable row level security;
revoke all on table public.hotmart_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.hotmart_webhook_events to service_role;
