# 🚗 UniCarona — TCC

Aplicativo de caronas compartilhadas entre universitários.
Projeto dividido em **backend** (Node.js + Express + PostgreSQL) e **mobile** (React Native + Expo).

---

## 📋 Pré-requisitos

Instale antes de começar:

- **Node.js** (versão 18 ou superior) — https://nodejs.org
- Conta no **Supabase** (gratuita) — https://supabase.com
- **Expo Go** no celular (app da loja) OU um emulador Android/iOS
- **VS Code** (recomendado)

Verifique o Node no terminal:
```bash
node --version
npm --version
```

---

## 🐘 Parte 1 — Banco de dados (Supabase)

O projeto usa o **Supabase** (PostgreSQL online e gratuito). Não precisa instalar nada.

1. Acesse https://supabase.com e crie uma conta (pode usar o GitHub).
2. Clique em **New project**. Defina um nome (ex: `unicarona`) e uma **senha do banco** — anote essa senha, você vai precisar dela.
3. Escolha a região mais próxima (ex: `South America (São Paulo)`).
4. Aguarde alguns minutos enquanto o projeto é criado.

### Criar as tabelas

1. No menu lateral do Supabase, clique em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `backend/supabase_setup.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**.
4. Pronto! Vá em **Table Editor** para confirmar que as 6 tabelas foram criadas.

### Pegar a string de conexão

1. Vá em **Project Settings** (ícone de engrenagem) > **Database**.
2. Em **Connection string**, escolha a aba **Transaction pooler** (porta 6543).
3. Copie a string. Ela se parece com:
   `postgresql://postgres.xxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`
4. Substitua `[SUA-SENHA]` pela senha que você definiu ao criar o projeto.
   Você vai colar essa string no `.env` do backend (próxima parte).

---

## ⚙️ Parte 2 — Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` copiando o exemplo:
```bash
# Windows (PowerShell)
copy .env.example .env
# Mac/Linux
cp .env.example .env
```

Abra o `.env` e cole sua connection string do Supabase no campo `DATABASE_URL`
(lembre de trocar `[SUA-SENHA]` pela senha do banco).

Crie as tabelas (caso ainda não tenha feito pelo SQL Editor do Supabase):
```bash
npm run migrate
```
> Se você já rodou o `supabase_setup.sql` no painel, pode pular este passo.

Inicie o servidor:
```bash
npm run dev
```

Você deve ver: `🚀 Servidor rodando na porta 3333`.
Teste abrindo http://localhost:3333 no navegador.

---

## 📱 Parte 3 — Mobile

```bash
cd mobile
npm install
```

**MUITO IMPORTANTE:** edite o arquivo `src/api/client.js` e troque o IP em `BASE_URL`
pelo **IP da sua máquina na rede local** (não use `localhost`, o celular não enxerga).

Para descobrir seu IP:
- **Windows:** abra o `cmd` e rode `ipconfig` → procure "Endereço IPv4" (ex: 192.168.0.105)
- **Mac/Linux:** rode `ifconfig` ou `ip addr`

Exemplo no `client.js`:
```js
const BASE_URL = 'http://192.168.0.105:3333';
```

Inicie o app:
```bash
npm start
```

Aponte a câmera do celular para o QR Code (com o Expo Go aberto).
O celular e o PC precisam estar na **mesma rede Wi-Fi**.

> Para emulador Android, use `http://10.0.2.2:3333` como BASE_URL.

---

## ✅ Fluxo de teste

1. Abra o app → toque em "Criar conta".
2. Use um e-mail institucional (ex: `joao@universidade.edu.br`).
   > Os domínios aceitos estão no `.env` do backend (`DOMINIOS_INSTITUCIONAIS`).
3. Após cadastrar, você entra automaticamente.
4. Na aba "Oferecer", crie uma carona.
5. Na aba "Buscar", veja a carona e solicite uma vaga (use outra conta).

---

## 📂 Estrutura

```
unicarona/
├── backend/          API REST
│   └── src/
│       ├── config/        conexão e migração do banco
│       ├── controllers/   regras de cada recurso
│       ├── middlewares/    autenticação JWT
│       ├── routes/        definição dos endpoints
│       └── utils/         token e validações
└── mobile/           App React Native
    └── src/
        ├── api/           cliente HTTP (axios)
        ├── components/    Botão, Input, CardCarona
        ├── contexts/      AuthContext (sessão)
        ├── navigation/    rotas e abas
        ├── screens/       telas do app
        └── theme/         cores e estilos
```

---

## 🔧 Próximos passos sugeridos (para evoluir o TCC)

- Integrar Google Maps API para exibir rotas no mapa
- Tela de chat entre motorista e passageiro (tabela `mensagens` já existe)
- Sistema de avaliação após a carona (tabela `avaliacoes` já existe)
- Notificações push com Expo Notifications
- Tela de "Minhas caronas" e "Solicitações recebidas"
- Verificação de e-mail por código (envio real via SendGrid)
