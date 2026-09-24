-- Marketing communications are optional; consent to register remains required.
alter table public.meu_ritmo_launch_leads
  alter column communications_consent set default false;

alter table public.meu_ritmo_launch_leads
  drop constraint if exists meu_ritmo_launch_leads_communications_consent_check;
