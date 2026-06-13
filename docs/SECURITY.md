# Security

## Segredos

Nunca versionar:

- `.env`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- tokens GitHub
- credenciais de banco
- credenciais de deploy

Somente `.env.example` deve ser versionado, sempre com valores vazios.

## OpenAI

A chave OpenAI pertence ao backend. O mobile usa JWT para chamar a API YARA AI e nunca recebe a chave.

## CI

O GitHub Actions executa:

- TypeScript check
- testes Node
- validacao do `.env.example`
- varredura simples de segredos
- `npm audit --audit-level=high`

