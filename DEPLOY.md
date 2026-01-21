# Guia de Deploy - Vortex Pharma

## Visão Geral

| Serviço | Plataforma | URL |
|---------|-----------|-----|
| Frontend | Vercel | https://vercel.com |
| Backend | Railway | https://railway.app |
| Banco de Dados | Railway PostgreSQL | (incluso) |

---

## PASSO 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `vortex-pharma` (ou o nome que preferir)
3. Deixe como **Private**
4. Clique em **Create repository**

### Subir o código:

```bash
cd "c:\Users\gusta\Documents\projetos\salud y performance"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/vortex-pharma.git
git push -u origin main
```

---

## PASSO 2: Deploy do Backend no Railway

### 2.1 Criar conta e projeto

1. Acesse https://railway.app
2. Faça login com GitHub
3. Clique em **New Project**
4. Selecione **Deploy from GitHub repo**
5. Escolha o repositório `vortex-pharma`
6. **IMPORTANTE**: Na configuração, defina o **Root Directory** como `backend`

### 2.2 Adicionar PostgreSQL

1. No projeto Railway, clique em **+ New**
2. Selecione **Database** → **PostgreSQL**
3. Aguarde a criação

### 2.3 Configurar Variáveis de Ambiente

No serviço do backend, vá em **Variables** e adicione:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vendas.cleanlabz@gmail.com
SMTP_PASS=lzxvkqnyojirturt
SMTP_FROM=vendas.cleanlabz@gmail.com
ORDER_EMAIL_TO=vendas.cleanlabz@gmail.com
FRONTEND_ORIGIN=https://seu-frontend.vercel.app
ADMIN_TOKEN=vortex-admin-2024-prod
PORT=3333
```

> **Nota**: Substitua `https://seu-frontend.vercel.app` pela URL real do Vercel após o deploy do frontend.

### 2.4 Configurar Build

Em **Settings** do serviço backend:
- **Root Directory**: `backend`
- **Build Command**: (deixe automático, usa Dockerfile)
- **Start Command**: (deixe automático)

### 2.5 Gerar Domínio

1. Vá em **Settings** → **Networking**
2. Clique em **Generate Domain**
3. Copie a URL gerada (ex: `https://vortex-backend-production.up.railway.app`)

---

## PASSO 3: Deploy do Frontend no Vercel

### 3.1 Criar projeto

1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em **Add New** → **Project**
4. Importe o repositório `vortex-pharma`
5. **IMPORTANTE**: Configure o **Root Directory** como `frontend`

### 3.2 Configurar Build

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3.3 Variáveis de Ambiente

Adicione:

```
NEXT_PUBLIC_API_BASE_URL=https://sua-url-railway.up.railway.app
```

> Substitua pela URL do Railway gerada no passo 2.5

### 3.4 Deploy

Clique em **Deploy** e aguarde.

---

## PASSO 4: Atualizar CORS no Backend

Após o deploy do frontend, copie a URL do Vercel (ex: `https://vortex-pharma.vercel.app`) e atualize a variável no Railway:

```
FRONTEND_ORIGIN=https://vortex-pharma.vercel.app
```

---

## PASSO 5: Popular o Banco de Dados

### Opção A: Via Railway CLI

```bash
npm install -g @railway/cli
railway login
railway link
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Opção B: Manualmente

1. No Railway, acesse o PostgreSQL
2. Vá em **Connect** e copie a connection string
3. No terminal local:

```bash
cd backend
DATABASE_URL="sua-connection-string" npx prisma migrate deploy
DATABASE_URL="sua-connection-string" npx prisma db seed
```

---

## Verificação Final

1. Acesse a URL do frontend no Vercel
2. Os produtos devem aparecer
3. Teste adicionar ao carrinho
4. Teste fazer um checkout
5. Verifique se o e-mail chegou

---

## URLs Finais (preencher após deploy)

- **Frontend**: https://_________________.vercel.app
- **Backend**: https://_________________.up.railway.app
- **API Health**: https://_________________.up.railway.app/health

---

## Comandos Úteis

### Atualizar após mudanças

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O deploy é automático em ambas as plataformas.

### Ver logs do Railway

```bash
railway logs
```

### Acessar banco de produção

```bash
railway run npx prisma studio
```
