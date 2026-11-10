# Front-end — Plataforma de Experiência do Cliente (Laboratório Cedro)

Aplicação web desenvolvida em **Next.js 16 (App Router + React 19 + TypeScript + Tailwind CSS v4)** para a **Plataforma de Experiência do Cliente do Laboratório Cedro (NIT)**.

Consome exclusivamente a API REST do Back-end (`NEXT_PUBLIC_API_URL`), sem acoplamento direto com o banco de dados no navegador.

---

## Estrutura de Rotas (`src/app`)

- `(publico)/pesquisa/[id]` — Formulário público de avaliação de atendimento (acessado via Link ou QR Code pelo cliente).
- `(auth)/login` — Tela 1: Autenticação corporativa para `Administrador`, `OperadorOuvidoria` e `CoordenadorUnidade`.
- `(sistema)/*` — Ambiente administrativo e operacional autenticado (Telas 2 a 9 da especificação funcional).

---

## Comandos

```bash
# Instalar dependências
npm install

# Rodar em ambiente de desenvolvimento (http://localhost:3000)
npm run dev

# Gerar build de produção e validar tipagem TypeScript
npm run build
```
