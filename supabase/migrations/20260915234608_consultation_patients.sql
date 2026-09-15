create table public.consultation_patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 254),
  whatsapp text not null check (whatsapp ~ '^55[1-9][0-9][0-9]{8,9}$'),
  main_concern text not null check (main_concern in ('ansiedade', 'alimentacao', 'corpo', 'rotina', 'outro')),
  privacy_consent boolean not null check (privacy_consent = true),
  marketing_consent boolean not null default false,
  dominant_dosha text not null check (dominant_dosha in ('vata', 'pitta', 'kapha')),
  secondary_dosha text check (secondary_dosha in ('vata', 'pitta', 'kapha')),
  is_balanced boolean not null default false,
  scores jsonb not null check (jsonb_typeof(scores) = 'object'),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  source jsonb not null default '{}'::jsonb check (jsonb_typeof(source) = 'object'),
  status text not null default 'new' check (status in ('new', 'contacted', 'scheduled', 'in_follow_up', 'completed', 'archived')),
  admin_notes text not null default '' check (char_length(admin_notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultation_patients_distinct_doshas check (secondary_dosha is null or secondary_dosha <> dominant_dosha)
);

create index consultation_patients_created_at_idx on public.consultation_patients (created_at desc);
create index consultation_patients_status_idx on public.consultation_patients (status, created_at desc);

alter table public.consultation_patients enable row level security;
revoke all on table public.consultation_patients from anon, authenticated;
grant select, insert, update, delete on table public.consultation_patients to service_role;

comment on table public.consultation_patients is 'Solicitações de consulta individual. Acesso exclusivo do backend administrativo.';
