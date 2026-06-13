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
JWT_SECRET=
```

Preencha esses valores somente no servidor. Para SQLite local, `DATABASE_URL` pode apontar para `sqlite:./data/yara.sqlite`.

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
- `GET /api/memories`
- `POST /api/generate-system`

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
