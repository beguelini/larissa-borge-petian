create table public.meu_ritmo_launch_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 254),
  whatsapp text not null check (whatsapp ~ '^55[1-9][0-9][0-9]{8,9}$'),
  privacy_consent boolean not null check (privacy_consent = true),
  communications_consent boolean not null check (communications_consent = true),
  source jsonb not null default '{}'::jsonb check (jsonb_typeof(source) = 'object'),
  created_at timestamptz not null default now()
);

comment on table public.meu_ritmo_launch_leads is
  'Cadastros consentidos para o pré-lançamento da comunidade Meu Ritmo.';

create index meu_ritmo_launch_leads_created_at_idx
  on public.meu_ritmo_launch_leads (created_at desc);

create index meu_ritmo_launch_leads_email_idx
  on public.meu_ritmo_launch_leads (lower(email));

alter table public.meu_ritmo_launch_leads enable row level security;

revoke all on table public.meu_ritmo_launch_leads from anon, authenticated;
grant insert on table public.meu_ritmo_launch_leads to service_role;

-- Only the server-side Vercel Function writes launch leads using service_role.
