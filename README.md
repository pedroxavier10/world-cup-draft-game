# 8-0 · O Mundial Perfeito

Jogo web inspirado em [82-0.com](https://www.82-0.com/) e [38-0.app](https://38-0.app/):
constrói o teu onze de lenda dos Mundiais, sorteia jogador a jogador e tenta o
percurso perfeito até à final. Projeto independente, sem afiliação à FIFA.

Stack: **Next.js 14 (App Router) · React 18 · TypeScript · Zustand**. Tudo corre no
browser — não há backend nem base de dados.

## Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Build de produção

```bash
npm run build
npm run start
```

## Deploy na Vercel (grátis)

1. Cria um repositório no GitHub e faz push deste projeto.
2. Entra em https://vercel.com com a tua conta GitHub.
3. **Add New → Project** e seleciona o repositório.
4. A Vercel deteta Next.js automaticamente — carrega em **Deploy** (zero configuração).
5. Em ~1 minuto ficas com um link `https://o-teu-projeto.vercel.app` para partilhar com os amigos.

Cada `git push` para a branch principal faz redeploy automático.

> Alternativas igualmente grátis: Netlify e Cloudflare Pages (também detetam Next.js).

## Estrutura

```
app/
  layout.tsx        fontes (next/font) + metadata
  page.tsx          orquestra os 3 ecrãs (setup / draft / result)
  globals.css       todo o estilo visual (edita aqui o aspeto)
components/
  Setup.tsx         ecrã inicial e filtros
  Draft.tsx         slot machine + escolha de jogadores
  Pitch.tsx         campo com o onze
  Result.tsx        estatísticas finais
  Toast.tsx         notificações
lib/
  data.ts           DATASET: edições, seleções, jogadores e ratings
  game.ts           formações, força da equipa e motor de simulação
  store.ts          estado global (Zustand)
  types.ts          tipos partilhados
```

## Onde mexer

- **Visual:** `app/globals.css` (cores nas variáveis `:root`) e os componentes.
- **Jogadores / edições:** `lib/data.ts`.
- **Equilíbrio da simulação:** `lib/game.ts` (função `simulate` e `playMatch`).
