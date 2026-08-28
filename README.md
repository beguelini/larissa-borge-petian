# Descubra seu dosha — Larissa Borge Petian

Funil mobile-first de descoberta educativa de doshas para a Larissa Borge Petian. A experiência conduz a visitante por 15 perguntas, calcula a tendência predominante, registra o lead com consentimento LGPD e apresenta um ritual inicial antes da oferta do programa **Ritmo Essencial**.

A identidade visual é totalmente tipográfica, complementada apenas por ilustrações vetoriais autorais em código. A aplicação não usa fotografias ou imagens geradas por IA.

## Stack

- React 19 + TypeScript + Vite
- Vercel para frontend e Function `/api/leads`
- Supabase Postgres para armazenamento privado dos leads
- Vitest para a regra de pontuação

## Desenvolvimento

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run lint
npx tsc -b --pretty false
npm run test:run
npm run build
```

## Variáveis de ambiente

Copie `.env.example` apenas como referência. Na Vercel, configure:

- `SUPABASE_URL`: URL do projeto Supabase, somente no servidor.
- `SUPABASE_SERVICE_ROLE_KEY`: service role, somente no servidor. Nunca use prefixo `VITE_`.
- `VITE_PRODUCT_CTA_URL`: URL pública do checkout ou lista de espera do Ritmo Essencial.

Sem `VITE_PRODUCT_CTA_URL`, o CTA usa o Instagram `@larissaborgepetian` como destino temporário.

## Banco de dados

A migration em `supabase/migrations` cria `public.dosha_quiz_leads` com RLS habilitado e remove todo acesso de `anon` e `authenticated`. A Vercel Function valida e recalcula o resultado no servidor antes de inserir com a service role.

Após vincular um projeto Supabase:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase test db
```

## Privacidade e conteúdo

- O consentimento necessário para liberar o resultado é separado do consentimento opcional de marketing.
- O questionário é uma leitura educativa de autoconhecimento, não diagnóstico ou orientação de saúde.
- A Política de Privacidade já descreve dados, finalidade, operadores e direitos, mas o contato provisório pelo Instagram deve ser substituído pelo e-mail oficial da Larissa antes da campanha.
- O CTA do produto deve receber a URL real de checkout ou lista de espera antes da publicação definitiva.
