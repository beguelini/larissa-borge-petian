alter table public.consultation_patients
  add column patient_notes text not null default '' check (char_length(patient_notes) <= 8000),
  add column care_plan text not null default '' check (char_length(care_plan) <= 8000),
  add column consultation_notes text not null default '' check (char_length(consultation_notes) <= 12000),
  add column consultation_at timestamptz,
  add column follow_up_at timestamptz,
  add column payment_due_at date,
  add column plan_type text not null default 'single' check (plan_type in ('single', 'combo', 'quarterly', 'semiannual')),
  add column plan_sessions integer not null default 1 check (plan_sessions between 1 and 52),
  add column unit_price_cents integer not null default 20000 check (unit_price_cents between 0 and 100000000),
  add column discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  add column plan_total_cents integer generated always as (
    round(unit_price_cents::numeric * plan_sessions::numeric * (1::numeric - discount_percent / 100::numeric))::integer
  ) stored,
  add column amount_paid_cents integer not null default 0 check (amount_paid_cents between 0 and 100000000),
  add column payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid', 'waived', 'refunded')),
  add column payment_method text check (payment_method in ('pix', 'credit_card', 'cash', 'other')),
  add column installments integer not null default 1 check (installments between 1 and 24),
  add column payment_reference text not null default '' check (char_length(payment_reference) <= 240);

create index consultation_patients_consultation_at_idx on public.consultation_patients (consultation_at) where consultation_at is not null;
create index consultation_patients_follow_up_at_idx on public.consultation_patients (follow_up_at) where follow_up_at is not null;
