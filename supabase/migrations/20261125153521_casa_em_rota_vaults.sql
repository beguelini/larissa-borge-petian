create table public.casa_em_rota_vaults (
  id uuid primary key default gen_random_uuid(),
  access_hash bytea not null unique check (octet_length(access_hash) = 32),
  ciphertext text not null check (char_length(ciphertext) between 40 and 1000000),
  revision integer not null default 0 check (revision >= 0)
);

alter table public.casa_em_rota_vaults enable row level security;
revoke all privileges on public.casa_em_rota_vaults from public, anon, authenticated;
grant select (id, ciphertext, revision), update (ciphertext, revision)
  on public.casa_em_rota_vaults to anon;

create policy "read vault with capability"
  on public.casa_em_rota_vaults for select to anon
  using (access_hash = pg_catalog.sha256(pg_catalog.convert_to(
    (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-family-access'), 'UTF8'
  )));

create policy "update vault with capability"
  on public.casa_em_rota_vaults for update to anon
  using (access_hash = pg_catalog.sha256(pg_catalog.convert_to(
    (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-family-access'), 'UTF8'
  )))
  with check (access_hash = pg_catalog.sha256(pg_catalog.convert_to(
    (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-family-access'), 'UTF8'
  )));
