begin;

select plan(5);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.dosha_quiz_leads'::regclass),
  'RLS esta habilitado'
);

select hasnt_table_privilege(
  'anon',
  'public.dosha_quiz_leads',
  'SELECT',
  'anon nao pode ler leads'
);

select hasnt_table_privilege(
  'anon',
  'public.dosha_quiz_leads',
  'INSERT',
  'anon nao pode inserir diretamente'
);

select hasnt_table_privilege(
  'authenticated',
  'public.dosha_quiz_leads',
  'SELECT',
  'usuarios autenticados nao podem ler leads'
);

select has_table_privilege(
  'service_role',
  'public.dosha_quiz_leads',
  'INSERT',
  'somente o backend possui caminho de insercao'
);

select * from finish();
rollback;
