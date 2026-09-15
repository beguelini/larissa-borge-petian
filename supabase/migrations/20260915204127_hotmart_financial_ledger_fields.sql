alter table public.hotmart_webhook_events
  add column buyer_name text,
  add column product_sku text,
  add column product_ucode text,
  add column offer_code text,
  add column coupon_code text,
  add column checkout_country text,
  add column payment_installments integer,
  add column full_amount numeric(14,2),
  add column producer_commission numeric(14,2),
  add column commissions jsonb not null default '[]'::jsonb;

create index hotmart_webhook_events_buyer_name_idx on public.hotmart_webhook_events (buyer_name);
create index hotmart_webhook_events_payment_type_idx on public.hotmart_webhook_events (payment_type);
