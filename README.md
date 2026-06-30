# YARA AI

Aplicativo Android com Expo React Native, backend Node.js + Express, SQLite, JWT e integracao segura com provedores de IA.

## Estrutura

```text
yara-ai/
  .env.example
  package.json
  backend/
    public/
      assets/
        yara-logo.png
        favicon.png
    src/
      config/
      db/
      middleware/
      routes/
      services/
      types/
      utils/
    package.json
    tsconfig.json
  mobile/
    App.tsx
    src/
      api/
      components/
      screens/
      types.ts
    app.json
    eas.json
    tailwind.config.js
```

## Identidade visual

A plataforma usa a marca oficial em `backend/public/assets/yara-logo.png` e o ícone PWA em `backend/public/assets/favicon.png`.

Se esses arquivos não existirem, a interface exibe automaticamente um placeholder elegante com `YA`. Para substituir a marca no futuro, coloque a nova arte nesses mesmos caminhos, mantendo os nomes dos arquivos.

Paleta principal:

- Primária: `#0A84FF`
- Secundária: `#1E40AF`
- Destaque: `#38BDF8`
- Fundo: `#081120`
- Cards: `#0F172A`
- Texto: `#FFFFFF`
- Texto secundário: `#94A3B8`

## Provedores de IA

- O backend seleciona o provedor por `AI_PROVIDER`.
- `AI_PROVIDER=gemini` usa `GEMINI_API_KEY`.
- `AI_PROVIDER=openai` usa `OPENAI_API_KEY`.
- Gemini e o provedor padrao.
- O app mobile nao muda quando o provedor muda.

## Seguranca das chaves

- Chaves nunca sao solicitadas dentro do aplicativo.
- Chaves nunca entram no APK.
- Chaves nunca sao retornadas para o frontend.
- O backend le chaves exclusivamente por variavel de ambiente.
- O backend nao inicia se a chave do provedor ativo ou `JWT_SECRET` estiverem ausentes.
- `.env` e `.env.*` ficam ignorados pelo Git; somente `.env.example` e versionado.

Crie `yara-ai/.env` ou `yara-ai/backend/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=
POSTGRES_URL=
REDIS_URL=
MEMORY_EMBEDDING_PROVIDER=local
MEMORY_EMBEDDING_DIMENSIONS=96
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Preencha esses valores somente no servidor. Para SQLite local, `DATABASE_URL` pode apontar para `sqlite:./data/yara.sqlite`.

## Integracoes externas

A Fase 7 adiciona um painel protegido em `/app` para Google Calendar, Gmail, Telegram, WhatsApp e notificacoes.

- Google Calendar e Gmail usam OAuth no backend. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI`.
- Telegram usa `TELEGRAM_BOT_TOKEN` e, opcionalmente, `TELEGRAM_WEBHOOK_SECRET`.
- WhatsApp Business usa `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` e `WHATSAPP_VERIFY_TOKEN`.
- Push notifications usam `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`; sem service worker/VAPID, a plataforma cria notificacoes internas de teste.
- Tokens OAuth sao criptografados no banco usando segredo derivado de `JWT_SECRET`.
- Quando uma credencial externa nao existe, a API retorna uma mensagem clara e nao simula sincronizacao.

## Memoria inteligente

A Fase 8.1 adiciona memória persistente e contextual sem remover a compatibilidade com SQLite.

- SQLite continua sendo o banco ativo padrão em `DATABASE_URL`.
- `POSTGRES_URL` prepara a migração para PostgreSQL/pgvector sem quebrar o ambiente atual.
- `REDIS_URL` prepara cache distribuído; sem Redis, a YARA usa cache local em memória.
- `MEMORY_EMBEDDING_PROVIDER=local` gera embeddings determinísticos no backend, sem expor chaves e sem chamar APIs externas.
- A API nova fica em `/api/memory` e a API antiga `/api/memories` permanece compatível.
- A busca semântica permite recuperar contexto por similaridade, mesmo quando a pergunta usa outras palavras.

## Backend

```bash
cd yara-ai
npm install
npm run dev:backend
```

Endpoints principais:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/system/status`
- `POST /api/system/test-openai` compatibilidade: testa o provedor definido em `AI_PROVIDER`
- `POST /api/chat`
- `GET /api/conversations`
- `PATCH /api/conversations/:id/pin`
- `PATCH /api/conversations/:id/archive`
- `PATCH /api/conversations/:id/move-top`
- `GET /api/conversations/:id/files`
- `POST /api/conversations/:id/projects`
- `PATCH /api/users/profile`
- `PATCH /api/users/password`
- `POST /api/uploads`
- `GET /api/memories`
- `POST /api/memories`
- `DELETE /api/memories/:id`
- `GET /api/projects`
- `POST /api/generator`
- `POST /api/generate-system`
- `GET /api/integrations/status`
- `GET /api/integrations/google/calendar/connect`
- `POST /api/integrations/google/calendar/sync`
- `GET /api/integrations/google/calendar/events`
- `GET /api/integrations/google/gmail/connect`
- `GET /api/integrations/gmail/messages`
- `POST /api/integrations/gmail/summarize`
- `POST /api/integrations/gmail/send`
- `POST /api/integrations/telegram/send`
- `POST /api/integrations/whatsapp/send`
- `POST /api/push/test`
- `GET /api/memory`
- `GET /api/memory/search`
- `GET /api/memory/status`
- `POST /api/memory`
- `PUT /api/memory/:id`
- `DELETE /api/memory/:id`

O primeiro usuario cadastrado recebe papel `admin` e pode testar o provedor de IA pela tela de Configuracoes.

## Mobile

O app usa o backend oficial Render em `https://yarachat.onrender.com`, configurado em `mobile/app.json` como `extra.apiBaseUrl`.
Na inicializacao, o app consulta `GET /api/health` e mostra `YARA Online` ou `YARA Offline`.

```bash
cd yara-ai/mobile
npx expo start
```

## Gerar APK Android

```bash
cd yara-ai/mobile
npm install
eas build -p android --profile preview
```

Comandos solicitados:

```bash
npm install
npx expo start
eas build -p android
```

Para gerar APK diretamente, use o profile `preview`, pois ele define `android.buildType` como `apk`.
