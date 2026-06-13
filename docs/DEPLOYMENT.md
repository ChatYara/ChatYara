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

Configure as variaveis de ambiente no painel do Render:

```env
OPENAI_API_KEY=
DATABASE_URL=sqlite:./data/yara.sqlite
JWT_SECRET=
```

O backend bloqueia a inicializacao se `OPENAI_API_KEY` ou `JWT_SECRET` estiverem ausentes.

Comandos:

```bash
npm ci
npm run build -w backend
npm run start -w backend
```

## APK

O APK nao contem a chave OpenAI. O app conversa com a OpenAI apenas via backend.

```bash
cd mobile
npx expo start
eas build -p android --profile preview
```

