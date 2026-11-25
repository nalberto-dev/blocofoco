<div align="center">

# 🎯 BlocoFoco

**Sua rotina em blocos. Estudos, projetos, treino e descanso, sem virar uma lista infinita de tarefas.**

[![Demo](https://img.shields.io/badge/demo-online-10b981?style=for-the-badge)](https://SEU-SITE.netlify.app)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instal%C3%A1vel-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)

[Ver o app](https://SEU-SITE.netlify.app) · [Reportar problema](https://github.com/nalberto-dev/blocofoco/issues)

</div>

---

## 📸 Telas

> Coloque os prints em `docs/` e ajuste os caminhos abaixo.

| Login | Hoje vs. Backlog | Modo foco |
|:---:|:---:|:---:|
| ![Login](docs/login.png) | ![Painel](docs/painel.png) | ![Foco](docs/foco.png) |

## ✨ Funcionalidades

- **Hoje vs. Backlog:** separe o que é do dia do que fica guardado para depois e mova com um toque.
- **Blocos por categoria:** Estudos, Projeto, Treino e Descanso, com duração estimada (25, 50, 90 min ou personalizada).
- **Micro-etapas:** checklist dentro de cada bloco, com barra de progresso automática.
- **Modo foco:** timer regressivo baseado em `Date.now()`, que não atrasa com a aba em segundo plano. Pausa, retoma e ajusta o tempo.
- **Resumo do dia:** blocos concluídos, tempo focado e progresso geral.
- **Histórico:** blocos concluídos agrupados por dia.
- **Notificação e som** quando o tempo acaba, e tela acesa durante o foco (Wake Lock).
- **PWA:** instalável no celular, com cache offline dos arquivos do app.
- **Responsivo:** barra inferior no celular e barra lateral no computador.
- **Seguro:** cada usuário só acessa os próprios dados (Row Level Security).

## 🛠️ Tecnologias

| Área | Tecnologia |
|---|---|
| Interface | React, TypeScript, Vite |
| Estilo | Tailwind CSS 3, Lucide Icons |
| Banco e login | Supabase (PostgreSQL, Auth, RLS) |
| PWA | vite-plugin-pwa (Workbox) |
| Hospedagem | Netlify |

## 🚀 Como rodar localmente

**Pré-requisitos:** Node.js 20 ou superior e uma conta gratuita no [Supabase](https://supabase.com).

```bash
# 1. Clonar e instalar
git clone https://github.com/nalberto-dev/blocofoco.git
cd blocofoco
npm install
```

**2. Criar o banco:** no Supabase, abra **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.

**3. Variáveis de ambiente:** crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

> Use apenas a chave **publicável**. Nunca coloque a chave `sb_secret_...` no projeto.

**4. Rodar:**

```bash
npm run dev
```

Abra `http://localhost:5173`.

## 📦 Build e PWA

```bash
npx pwa-assets-generator --preset minimal-2023 public/icon.svg   # gera os ícones
npm run build
npm run preview
```

Abra `http://localhost:4173` e confira em **F12 → Application → Manifest**.

## 🗂️ Estrutura

```
blocofoco/
├─ supabase/schema.sql      # tabelas e políticas RLS
├─ public/                  # ícones do PWA e _redirects
└─ src/
   ├─ components/           # BlockCard, BlockForm, FocusMode, Layout...
   ├─ contexts/             # AuthContext
   ├─ hooks/                # useBlocks (acesso ao Supabase)
   ├─ lib/                  # supabase, notify, date
   ├─ pages/                # Login, Planner, Done
   └─ types.ts
```

## 🔐 Segurança

- RLS ativado em `routine_blocks` e `block_checklist_items`, com `auth.uid() = user_id`.
- `ON DELETE CASCADE` nas relações.
- O `.env` está no `.gitignore` e a chave usada no navegador é só a publicável.

## 🗺️ Próximos passos

- [ ] Web Push (aviso com o app fechado)
- [ ] Recuperação de senha
- [ ] Sequência de dias seguidos
- [ ] Reordenar blocos por arrastar
- [ ] Resumo semanal por categoria

## 👤 Autor

**Nalberto** · [GitHub](https://github.com/nalberto-dev)

---

<div align="center">Feito com foco. 🎯</div>