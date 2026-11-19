<div align="center">

# 🟣 LESS-Kcal-s

### Sistema Inteligente de Controle Alimentar, Calorias e Macronutrientes (PWA)

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-8B5CF6?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/Licença-MIT-8B5CF6?style=for-the-badge)](LICENSE)

<br />

**LESS-Kcal-s** é uma aplicação Full Stack Progressive Web App (PWA) de alto desempenho, desenvolvida com foco em **fricção zero** no registro alimentar diário. Elimina a necessidade de cálculos manuais ou digitação de calorias através de uma base nutricional brasileira pré-populada (tabelas **TACO** e **TBCA**), inteligência artificial generativa multimodal e arquitetura escalável e tipada de ponta a ponta.

</div>

---

## 🌟 Destaques e Diferenciais

### 🎯 A Regra de Ouro: Zero Digitação de Calorias
O usuário **nunca** precisa digitar valores calóricos ou de macronutrientes.
- Digite apenas o nome do alimento ou use o autocomplete instantâneo.
- Escolha a unidade caseira (`g`, `ml`, `unidade`, `colher de sopa`, `concha`, `fatia`).
- O sistema calcula na hora a proporção exata e armazena um snapshot nutricional imutável.

### 🥗 Base Nutricional TACO & TBCA Nativa
- Banco de dados pré-populado via Prisma Seed com mais de 90 alimentos essenciais da culinária brasileira (arroz branco e integral, feijão carioca e preto, filé de frango, cortes bovinos magros, tilápia, ovos, frutas, verduras, azeite, pasta de amendoim, suplementos como Whey Protein e Creatina).
- Suporte a cadastro de alimentos personalizados pelo usuário.

### 🤖 Registro Assistido por Inteligência Artificial (Multimodal)
1. **Registro por Texto Natural:** *"Comi 150g de arroz, 120g de frango grelhado e 2 ovos"*. O backend extrai entidades, quantidades e cruza com a tabela TACO/TBCA.
2. **Registro por Foto do Prato:** Envie ou tire foto da sua refeição. O sistema identifica alimentos, estima porções e gera uma prévia detalhada com badge explícito de estimativa.
3. **Revisão Obrigatória:** A IA **nunca** salva registros sem aprovação. O usuário revisa, ajusta as quantidades e confirma com um clique.

### 📅 Versionamento e Isolamento Histórico de Metas
- **Regra Crítica:** Alterar as metas hoje define os objetivos a partir de hoje. **O histórico passado não é alterado nem recalculado**, preservando a integridade dos seus dados ao longo do tempo.
- Calendário mensal interativo com marcação visual dos dias registrados e detalhamento com 1 clique.
- Relatórios analíticos com gráficos interativos via **Recharts** (evolução vs. meta, distribuição semanal de macros e médias).

### 📱 Experiência Mobile-First & PWA
- Totalmente instalável no Android, iOS e Desktop.
- Service Worker com cache e armazenamento offline em `localStorage` para navegação contínua mesmo sem internet.
- Design refinado em tema **Preto Profundo (`#09090B`) e Roxo Vibrante (`#8B5CF6`)**, com suporte a alternância para Modo Claro.

---

## 🎨 Identidade Visual (Preto & Roxo)

| Elemento | Cor / Hex | Aplicação |
|---|---|---|
| **Fundo Principal** | `#09090B` / `#000000` | Dark mode padrão de alto contraste |
| **Superfícies / Cards** | `#121216` / `#18181B` | Elevação de componentes e cartões |
| **Bordas Sutis** | `#27272A` | Delimitação sutil e elegante |
| **Primária / Destaque** | `#8B5CF6` / `#7C3AED` | Anel de calorias, botões principais e CTA |
| **Proteínas** | `#C084FC` (Lilás) | Barras de progresso e badges |
| **Carboidratos** | `#38BDF8` (Azul/Ciano) | Barras de progresso e badges |
| **Gorduras** | `#F472B6` (Pink/Magenta) | Barras de progresso e badges |
| **Alertas** | `#EF4444` (Vermelho Suave) | Excedente calórico ou alerta de metas |

---

## 🏗️ Arquitetura do Projeto

```
LESS-Kcal-s/
├── backend/                        # API REST Node.js + TypeScript + Express
│   ├── prisma/
│   │   ├── schema.prisma           # Modelagem PostgreSQL para produção
│   │   ├── schema.sqlite.prisma    # Suporte zero-config local / testes
│   │   └── seed.ts                 # Script de seed (TACO/TBCA + usuário demo)
│   ├── src/
│   │   ├── config/                 # Variáveis de ambiente e Prisma Client
│   │   ├── controllers/            # Controladores REST (Auth, Goals, Foods, Meals, Reports, AI)
│   │   ├── data/                   # Dicionário de alimentos TACO/TBCA
│   │   ├── middlewares/            # Auth JWT, sanitização, validação Zod e errorHandler
│   │   ├── routes/                 # Definição modular de rotas da API
│   │   ├── services/               # Regras de negócio e cálculo nutricional proporcional
│   │   ├── utils/                  # Calculadora nutricional e manipuladores de data
│   │   ├── app.ts                  # Configuração do Express e CORS
│   │   └── server.ts               # Ponto de entrada do servidor
│   └── tests/                      # Testes automatizados (Vitest)
│
├── frontend/                       # Aplicação SPA / PWA React + Vite + Tailwind
│   ├── public/
│   │   ├── favicon.svg             # Logotipo em vetor
│   │   ├── manifest.json           # Manifesto PWA instalável
│   │   └── sw.js                   # Service Worker com cache e fallback offline
│   └── src/
│       ├── components/
│       │   ├── dashboard/          # Anel de calorias, barras de macros, refeições
│       │   ├── history/            # Calendário mensal com destaque visual
│       │   ├── layout/             # Header, Bottom Navigation Bar mobile-first
│       │   ├── modals/             # Modais (Busca TACO, Texto IA, Foto IA, Favoritos)
│       │   ├── profile/            # Configuração de metas e preferências
│       │   ├── reports/            # Gráficos Recharts (Tendência calórica, Macros)
│       │   └── ui/                 # Componentes reutilizáveis (Button, Input, Card, Modal)
│       ├── context/                # Contextos globais (Auth, Theme)
│       ├── services/               # Cliente HTTP e armazenamento offline
│       └── utils/                  # Formatadores e utilitários
│
└── package.json                    # Scripts unificados do monorepo
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior instalado.
- [Git](https://git-scm.com/) instalado.
- (Opcional) Banco de dados [PostgreSQL](https://www.postgresql.org/) ou utilize o SQLite embutido para testes imediatos sem instalação adicional.

### 2. Clonar o Repositório
```bash
git clone https://github.com/lexblu-Z/LESS-Kcal-s.git
cd LESS-Kcal-s
```

### 3. Configurar Variáveis de Ambiente (`.env`)

#### No Backend (`backend/.env`):
Crie o arquivo `backend/.env` (ou copie de `backend/.env.example`):
```env
PORT=3001
NODE_ENV=development

# Para PostgreSQL (produção ou local):
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/less_kcals?schema=public"

# Ou para SQLite (zero-config imediato para desenvolvimento):
# DATABASE_URL="file:./dev.db"

JWT_SECRET="less_kcals_super_secret_jwt_key_2026_change_in_production"
JWT_EXPIRES_IN="7d"

# Opcional: Chave da Google Gemini API para IA generativa em nuvem
# (Se vazia, o sistema usa o motor NLP e análise local automaticamente)
GEMINI_API_KEY=""
AI_MODEL="gemini-1.5-flash"

CORS_ORIGIN="http://localhost:5173"
```

#### No Frontend (`frontend/.env`):
```env
VITE_API_URL="/api"
```

---

### 4. Instalar Dependências e Inicializar o Banco

```bash
# 1. Instalar dependências do backend
cd backend
npm install

# 2. Gerar cliente do Prisma e rodar migrações
npm run prisma:generate

# Se estiver usando SQLite local zero-config:
npm run prisma:push:sqlite
npm run seed

# Se estiver usando PostgreSQL:
# npm run prisma:push
# npm run seed

cd ..

# 3. Instalar dependências do frontend
cd frontend
npm install
cd ..
```

---

### 5. Iniciar os Servidores em Modo de Desenvolvimento

Em dois terminais separados (ou usando os scripts do monorepo):

**Terminal 1 (Backend - Porta 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Porta 5173):**
```bash
cd frontend
npm run dev
```

Abra seu navegador em [http://localhost:5173](http://localhost:5173).

> 💡 **Acesso Rápido de Teste (Demo):**
> - **E-mail:** `demo@lesskcals.com`
> - **Senha:** `demo123456`
> - Ou clique no botão *"Entrar com Usuário Demo"* na tela de login.

---

## 🧪 Testes Automatizados

O projeto conta com suítes de testes automatizados com [Vitest](https://vitest.dev/), cobrindo as regras centrais de negócio:
- **Cálculos proporcionais de calorias e macros** (base 100g/ml e conversões de porções caseiras).
- **Isolamento e versionamento de metas por data** (garante que atualizar hoje nunca altera o passado).
- **CRUD e snapshots nutricionais de refeições** (adição, edição e exclusão de itens).
- **Extração e correspondência de texto natural com IA (NLP)**.

Para executar os testes:
```bash
cd backend
npm run test
```

---

## 👤 Autor

Desenvolvido por **Leonardo Englerth dos Santos Souza**.

- 📧 **E-mail:** [leonardoessouza@gmail.com](mailto:leonardoessouza@gmail.com)
- 🐙 **GitHub:** [@lexblu-Z](https://github.com/lexblu-Z)
- 💼 **Projeto:** [LESS-Kcal-s](https://github.com/lexblu-Z/LESS-Kcal-s)

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para obter mais detalhes.
