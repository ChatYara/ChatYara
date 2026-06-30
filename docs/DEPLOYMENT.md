# Deploy YARA AI

## GitHub

O repositorio oficial deve apontar para `ChatYara`. O branch padrao e `main`.

Fluxo recomendado:

```bash
git status
git add .
git commit -m "descricao da mudanca"
git push origin main
```

Nunca use `git add` para arquivos `.env`, credenciais, tokens ou chaves.

## Backend Render

URL oficial:

```text
https://yarachat.onrender.com
```

Configure as variaveis de ambiente no painel do Render:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=sqlite:./data/yara.sqlite
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

O backend bloqueia a inicializacao se `JWT_SECRET` ou a chave do provedor ativo estiverem ausentes.

Para Gemini, use:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
```

Para OpenAI, use:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
```

Integracoes externas:

- Google Calendar e Gmail: configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI`. A URI deve apontar para `https://yarachat.onrender.com/api/integrations/google/callback`.
- Telegram: configure `TELEGRAM_BOT_TOKEN` e, se usar webhook secreto, `TELEGRAM_WEBHOOK_SECRET`.
- WhatsApp Business: configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` e `WHATSAPP_VERIFY_TOKEN`.
- Push: configure `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` quando o service worker de push remoto estiver ativo.
- Sem credenciais, a API continua online e retorna avisos claros para o usuario administrador.

Memoria inteligente:

- Mantenha `DATABASE_URL=sqlite:./data/yara.sqlite` enquanto a instancia Render atual usar SQLite.
- Configure `POSTGRES_URL` somente quando o banco PostgreSQL estiver provisionado e pronto para migração.
- Ative pgvector no PostgreSQL antes de migrar embeddings para vetor nativo.
- Configure `REDIS_URL` quando houver Redis gerenciado; sem Redis, o backend usa cache local em memória.
- `MEMORY_EMBEDDING_PROVIDER=local` e `MEMORY_EMBEDDING_DIMENSIONS=96` funcionam sem credenciais externas.

Comandos:

```bash
npm ci
npm run build -w backend
npm run start -w backend
```

## APK

O APK nao contem chaves de IA. O app conversa com Gemini ou OpenAI apenas via backend.
O backend oficial do app esta configurado em `mobile/app.json` como `https://yarachat.onrender.com`.

```bash
cd mobile
npx expo start
eas build -p android --profile preview
```
