create table public.dosha_quiz_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 254),
  privacy_consent boolean not null check (privacy_consent = true),
  marketing_consent boolean not null default false,
  dominant_dosha text not null check (dominant_dosha in ('vata', 'pitta', 'kapha')),
  secondary_dosha text check (secondary_dosha in ('vata', 'pitta', 'kapha')),
  is_balanced boolean not null default false,
  scores jsonb not null,
  answers jsonb not null,
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint dosha_quiz_leads_distinct_doshas
    check (secondary_dosha is null or secondary_dosha <> dominant_dosha),
  constraint dosha_quiz_leads_scores_object
    check (jsonb_typeof(scores) = 'object'),
  constraint dosha_quiz_leads_answers_object
    check (jsonb_typeof(answers) = 'object'),
  constraint dosha_quiz_leads_source_object
    check (jsonb_typeof(source) = 'object')
);

comment on table public.dosha_quiz_leads is
  'Leads e resultados do questionario educativo de doshas da Larissa Borge Petian.';

create index dosha_quiz_leads_created_at_idx
  on public.dosha_quiz_leads (created_at desc);

create index dosha_quiz_leads_email_idx
  on public.dosha_quiz_leads (lower(email));

alter table public.dosha_quiz_leads enable row level security;

revoke all on table public.dosha_quiz_leads from anon, authenticated;
grant select, insert, update, delete on table public.dosha_quiz_leads to service_role;

-- Nao ha politicas publicas por desenho. Somente a Vercel Function, usando a
-- service role no servidor, pode inserir ou consultar os leads.
