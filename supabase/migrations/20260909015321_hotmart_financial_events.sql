alter table public.hotmart_webhook_events
  add column product_name text,
  add column event_created_at timestamptz,
  add column purchase_status text,
  add column gross_amount numeric(14,2),
  add column currency text,
  add column payment_type text;

create index hotmart_webhook_events_event_created_at_idx on public.hotmart_webhook_events (event_created_at desc);
create index hotmart_webhook_events_product_name_idx on public.hotmart_webhook_events (product_name);
