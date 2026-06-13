# Security

## Segredos

Nunca versionar:

- `.env`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- tokens GitHub
- credenciais de banco
- credenciais de deploy

Somente `.env.example` deve ser versionado, sempre com valores vazios.

## Provedores de IA

As chaves dos provedores pertencem ao backend. O mobile usa JWT para chamar a API YARA AI e nunca recebe `GEMINI_API_KEY`, `OPENAI_API_KEY` ou `JWT_SECRET`.

## CI

O GitHub Actions executa:

- TypeScript check
- testes Node
- validacao do `.env.example`
- varredura simples de segredos
- `npm audit --audit-level=high`
