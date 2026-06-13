# YARA AI

Aplicativo Android com Expo React Native, backend Node.js + Express, SQLite, JWT e integracao segura com OpenAI.

## Estrutura

```text
yara-ai/
  .env.example
  package.json
  backend/
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

## Seguranca da OpenAI

- A chave nunca e solicitada dentro do aplicativo.
- A chave nunca entra no APK.
- A chave nunca e retornada para o frontend.
- O backend le `OPENAI_API_KEY` exclusivamente por variavel de ambiente.
- O backend nao inicia se `OPENAI_API_KEY` ou `JWT_SECRET` estiverem ausentes.
- `.env` e `.env.*` ficam ignorados pelo Git; somente `.env.example` e versionado.

Crie `yara-ai/.env` ou `yara-ai/backend/.env`:

```env
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
- `GET /api/system/status`
- `POST /api/system/test-openai`
- `POST /api/chat`
- `GET /api/conversations`
- `GET /api/memories`
- `POST /api/generate-system`

O primeiro usuario cadastrado recebe papel `admin` e pode testar a OpenAI pela tela de Configuracoes.

## Mobile

Em emulador Android, o app usa `http://10.0.2.2:3333`. Em celular fisico, altere `mobile/app.json` em `extra.apiUrl` para o IP local do servidor.

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
