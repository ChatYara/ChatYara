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
JWT_SECRET=
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
