# Descubra seu dosha — Larissa Petian

Funil mobile-first de descoberta educativa de doshas para a Larissa Petian. A experiência conduz a visitante por 15 perguntas, calcula a tendência predominante, registra o lead com consentimento LGPD e apresenta um ritual inicial antes da oferta do programa **Ritmo Essencial**.

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
- `DASHBOARD_USERNAME` e `DASHBOARD_PASSWORD`: credenciais de acesso ao painel administrativo.
- `DASHBOARD_SESSION_SECRET`: segredo aleatório de pelo menos 32 caracteres usado para assinar a sessão do painel.

## Banco de dados

A migration em `supabase/migrations` cria `public.dosha_quiz_leads` com RLS habilitado e remove todo acesso de `anon` e `authenticated`. A Vercel Function valida e recalcula o resultado no servidor antes de inserir com a service role.

Após vincular um projeto Supabase:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase test db
```

## Painel de interesse

O painel em `/painel` e a lista em `/cadastros` exigem login em `/login`. A sessão é HTTP-only, assinada no servidor e válida por oito horas. Após autenticação, a tela de cadastros apresenta nome, e-mail, resultado e consentimento; essas informações nunca são retornadas por APIs sem sessão válida.

## Privacidade e conteúdo

- O consentimento necessário para liberar o resultado é separado do consentimento opcional de marketing.
- O questionário é uma leitura educativa de autoconhecimento, não diagnóstico ou orientação de saúde.
- A Política de Privacidade já descreve dados, finalidade, operadores e direitos, mas o contato provisório pelo Instagram deve ser substituído pelo e-mail oficial da Larissa antes da campanha.
- Ao final do resultado, a pessoa pode entrar no grupo de WhatsApp do pré-lançamento.
