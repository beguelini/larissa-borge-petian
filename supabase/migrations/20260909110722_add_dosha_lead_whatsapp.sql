alter table public.dosha_quiz_leads
  add column whatsapp text;

alter table public.dosha_quiz_leads
  add constraint dosha_quiz_leads_whatsapp_format
  check (whatsapp is null or whatsapp ~ '^55[1-9][0-9][0-9]{8,9}$');

comment on column public.dosha_quiz_leads.whatsapp is
  'WhatsApp brasileiro normalizado, somente dígitos com o código 55. Obrigatório para novos cadastros no backend.';
