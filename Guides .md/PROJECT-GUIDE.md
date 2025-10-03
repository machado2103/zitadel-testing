# Guia Completo do Projeto - Zitadel Click Tracker

**Documentação técnica para implementação de autenticação OAuth/OIDC com Zitadel**

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Configuração do Zitadel](#configuração-do-zitadel)
4. [Configuração do Ambiente Local](#configuração-do-ambiente-local)
5. [Backend - Explicação Técnica](#backend---explicação-técnica)
6. [Frontend - Explicação Técnica](#frontend---explicação-técnica)
7. [Fluxos da Aplicação](#fluxos-da-aplicação)
8. [Base de Dados](#base-de-dados)
9. [Execução](#execução)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

Aplicação full-stack que demonstra autenticação OAuth/OIDC com Zitadel, incluindo:
- Autenticação com PKCE (Proof Key for Code Exchange)
- Verificação de JWT com JWKS
- API RESTful protegida por tokens
- Gestão de sessões e tracking de eventos

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Frontend** | Vue 3 | 3.4.21 | Framework JavaScript progressivo |
| | Vite | 7.1.7 | Build tool e dev server |
| | @zitadel/vue | 1.1.7 | SDK oficial de autenticação Zitadel |
| | Axios | 1.12.2 | Cliente HTTP |
| | Vue Router | 4.3.0 | Gestão de rotas |
| **Backend** | Node.js + Express | 5.1.0 | Framework web |
| | SQLite3 | 5.1.7 | Base de dados embutida |
| | jose | 6.1.0 | Verificação JWT |
| | CORS | 2.8.5 | Cross-Origin Resource Sharing |
| **Auth** | Zitadel | Cloud | Identity Provider (IAM) |

---

## Arquitetura

### Estrutura de Pastas

```
zitadel-testing/
├── server/                         # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js             # SQLite + Promise wrappers
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── routes/
│   │   └── clicks.js               # API endpoints
│   ├── services/
│   │   └── clickService.js         # Business logic
│   └── index.js                    # Server entry point
│
├── src/                            # Frontend (Vue 3)
│   ├── composables/
│   │   ├── useAuth.js              # Authentication composable
│   │   └── useClickApi.js          # API client composable
│   ├── router/
│   │   └── index.js                # Vue Router configuration
│   ├── views/
│   │   ├── LoginView.vue           # Login page
│   │   └── MainView.vue            # Protected main page
│   ├── App.vue                     # Root component
│   └── main.js                     # Vue app initialization
│
├── .env                            # Environment variables
├── clicks.db                       # SQLite database
├── package.json
├── vite.config.js
└── zitadel-api-key.json           # Zitadel service account key
```

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Vue 3 Frontend (Port 5173)                   │  │
│  │                                                           │  │
│  │  Components: LoginView, MainView                         │  │
│  │  Composables: useAuth(), useClickApi()                   │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         @zitadel/vue SDK (OIDC Client)              │ │  │
│  │  │  - signIn/signOut, accessToken, isAuthenticated     │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────┬───────────────────────────┘
               │                      │
               │ OAuth Redirect       │ API Calls (JWT Bearer)
               ↓                      ↓
    ┌──────────────────┐   ┌──────────────────────────────┐
    │     Zitadel      │   │    Express Backend (3001)    │
    │   (Cloud SaaS)   │   │                              │
    │                  │   │  Middleware:                 │
    │ - /authorize     │   │   1. CORS                    │
    │ - /token         │   │   2. JSON Parser             │
    │ - /userinfo      │   │   3. Logger                  │
    │ - /keys (JWKS)   │   │   4. authenticateZitadel     │
    │                  │   │                              │
    │ User Login UI    │   │  Routes: /api/clicks/*       │
    └──────────────────┘   │  Services: clickService      │
                           │  Database: SQLite (clicks.db)│
                           └──────────────────────────────┘
```

---

## Configuração do Zitadel

Este é o tutorial completo e detalhado para configurar o Zitadel do zero.

### Passo 1: Criar Conta no Zitadel

#### 1.1. Aceder ao Site
1. Navegar para: **https://zitadel.com/**
2. Clicar em **"Try for Free"** ou **"Get Started"**

#### 1.2. Criar Conta
1. Escolher método de registo:
   - Email + Password
   - Google
   - GitHub
2. Preencher os dados solicitados
3. Confirmar email (se aplicável)

#### 1.3. Criar Instância Zitadel
1. Após login, será solicitado para criar uma instância
2. Preencher:
   - **Organization Name:** Nome da organização (ex: "My Company")
   - **Instance URL:** Nome único (ex: "my-company-demo")
3. Clicar em **"Create Instance"**

#### 1.4. Guardar URL da Instância

**IMPORTANTE:** O Zitadel gera um URL único para a sua instância.

**Formato:** `https://<nome-escolhido>.<região>.zitadel.cloud`

**Exemplo:** `https://test-qgqmqq.us1.zitadel.cloud`

**Guardar este URL** - será necessário em múltiplos locais da configuração.

---

### Passo 2: Criar Projeto

#### 2.1. Aceder a Projects
1. No dashboard do Zitadel, menu lateral esquerdo
2. Clicar em **"Projects"**

#### 2.2. Criar Novo Projeto
1. Clicar em **"Create New Project"** ou **"+ New"**
2. Preencher:
   - **Name:** `Click Tracker` (ou nome desejado)
   - **Description:** `Projeto para autenticação OAuth com Vue 3`
3. Clicar em **"Continue"** ou **"Save"**

#### 2.3. Resultado

Visualização do projeto criado:

```
┌─────────────────────────────────────────┐
│ Projects                                │
├─────────────────────────────────────────┤
│ Click Tracker                           │
│ Created: 2025-10-03                     │
│ Description: Projeto para autenticação  │
│ [View Details]                          │
└─────────────────────────────────────────┘
```

---

### Passo 3: Criar Aplicação Frontend (Vue.js)

A aplicação frontend usa autenticação PKCE (mais segura para SPAs).

#### 3.1. Aceder a Applications
1. Dentro do projeto **Click Tracker**, clicar em **"Applications"**
2. Clicar em **"New"** ou **"Create Application"**

#### 3.2. Configurar Aplicação

**Informações Básicas:**
- **Name:** `Click Tracker Frontend`
- **Description:** `Aplicação Vue.js do frontend`

**Tipo de Aplicação:**
- Selecionar **"WEB"**
- Clicar em **"Continue"**

**Método de Autenticação:**
- Selecionar **"PKCE"** (Proof Key for Code Exchange)

**Razões para usar PKCE:**
- Mais seguro para Single Page Applications (SPAs)
- Não requer client secret (que não pode ser guardado de forma segura no browser)
- Protege contra ataques de interceção de authorization code

- Clicar em **"Continue"**

#### 3.3. Configurar Redirect URIs

**CRÍTICO:** As Redirect URIs definem para onde o Zitadel pode redirecionar após autenticação.

**Redirect URIs** (adicionar ambas):
```
http://localhost:5173
http://localhost:5173/
```

**Post Logout Redirect URIs:**
```
http://localhost:5173/
```

**Notas importantes:**
- Adicionar com e sem `/` final (diferentes browsers tratam de forma diferente)
- Em produção, substituir por domínio real (ex: `https://meusite.com`)
- Zitadel valida estritamente estas URIs por segurança

#### 3.4. Guardar Client ID

Após criar a aplicação, será apresentado o ecrã de detalhes.

1. Localizar **"Client ID"**
2. Copiar este ID (formato: `340415062625762377`)
3. **GUARDAR em local seguro** (necessário para configuração local)

**Estrutura visual:**
```
┌────────────────────────────────────────────────┐
│ Click Tracker Frontend                         │
├────────────────────────────────────────────────┤
│ Client ID:  340415062625762377                 │
│ Type:       WEB                                │
│ Auth:       PKCE                               │
├────────────────────────────────────────────────┤
│ Redirect URIs:                                 │
│  http://localhost:5173                         │
│  http://localhost:5173/                        │
├────────────────────────────────────────────────┤
│ Post Logout URIs:                              │
│  http://localhost:5173/                        │
└────────────────────────────────────────────────┘
```

#### 3.5. Configurar Token Settings (Recomendado)

1. No detalhe da aplicação, localizar **"Token Settings"**
2. Configurar:
   - **Access Token Type:** `JWT` (recomendado para verificação stateless)
   - **Access Token Lifetime:** `3600` segundos (1 hora)
   - **Refresh Token:** Habilitado (permite renovar sessões sem re-autenticação)

---

### Passo 4: Criar Aplicação Backend (API)

O backend necessita de credenciais próprias para verificar tokens JWT.

#### 4.1. Criar Nova Aplicação
1. Ainda no projeto **Click Tracker**, ir a **"Applications"**
2. Clicar em **"New"** novamente
3. Preencher:
   - **Name:** `Click Tracker Backend`
   - **Description:** `API backend Node.js`

#### 4.2. Tipo de Aplicação
- Selecionar **"API"**
- Clicar em **"Continue"**

#### 4.3. Método de Autenticação
- Selecionar **"JWT with Private Key"**

**Razões para JWT with Private Key:**
- Backend usa service account authentication
- Não depende de user login
- Permite ao backend fazer chamadas autenticadas ao Zitadel
- Usa chave privada RSA para assinar requests

- Clicar em **"Continue"**

#### 4.4. Gerar Chave JSON

**PASSO CRÍTICO - LER COM ATENÇÃO**

1. Na configuração da aplicação backend, localizar **"Keys"** ou **"Service Account Keys"**
2. Clicar em **"New Key"** ou **"Generate Key"**
3. Configurar:
   - **Type:** Selecionar **"JSON"**
   - **Expiration:** Deixar em "No expiration" (ou definir período se preferir)
4. Clicar em **"Add"** ou **"Generate"**

#### 4.5. Download da Chave

1. Após gerar, aparecerá botão **"Download"**
2. **DESCARREGAR IMEDIATAMENTE** o ficheiro JSON
   - Nome típico: `340439932633904189.json`
   - **Esta é a única oportunidade de fazer download desta chave**
3. **Renomear ficheiro** para: `zitadel-api-key.json`
4. **Mover para raiz do projeto** (ao lado de `package.json`)

**Estrutura do ficheiro JSON:**
```json
{
  "type": "serviceaccount",
  "keyId": "340439932633904189",
  "key": "-----BEGIN RSA PRIVATE KEY-----\nMIIE...(conteúdo)...==\n-----END RSA PRIVATE KEY-----\n",
  "userId": "340439932633904188"
}
```

#### 4.6. Guardar Client ID do Backend

1. Localizar **"Client ID"** na aplicação backend
2. Copiar este ID (exemplo: `340439932633904189`)
3. **Guardar junto com o Frontend Client ID**

**SEGURANÇA CRÍTICA:**
- **NUNCA** fazer commit do `zitadel-api-key.json` para controlo de versão
- Adicionar ao `.gitignore`:
  ```
  zitadel-api-key.json
  *.key.json
  .env
  ```
- Em produção, usar secrets management (AWS Secrets Manager, Azure Key Vault, etc.)

---

### Passo 5: Configurar Scopes e Permissões

Os **scopes** determinam quais informações o Zitadel partilha sobre o utilizador.

#### 5.1. Aceder a Project Settings
1. No projeto **Click Tracker**, clicar em **"Settings"**
2. Localizar **"Token Settings"** ou **"OIDC Configuration"**

#### 5.2. Verificar Scopes Habilitados

Garantir que estes scopes estão **habilitados**:

| Scope | Descrição | Obrigatório | Impacto se Desabilitado |
|-------|-----------|-------------|-------------------------|
| `openid` | Identificação do utilizador (user ID) | Sim | Autenticação não funciona |
| `profile` | Nome, nome próprio, apelido | Sim | Backend não recebe nome |
| `email` | Endereço de email | Sim | Backend não recebe email |
| `offline_access` | Permite refresh tokens | Opcional | Sessão não pode ser renovada |

**Sem `profile` e `email`:**
- Backend apenas recebe `sub` (user ID)
- UserInfo endpoint não retorna nome/email
- UI mostrará valores genéricos ("User" em vez do nome real)

---

### Passo 6: Resumo da Configuração Zitadel

Neste ponto, deverá ter os seguintes valores:

| Item | Onde Encontrar | Exemplo | Uso |
|------|----------------|---------|-----|
| **Zitadel URL** | URL da instância criada | `https://test-qgqmqq.us1.zitadel.cloud` | `.env` (VITE_ZITADEL_ISSUER) |
| **Frontend Client ID** | Applications → Frontend → Client ID | `340415062625762377` | `.env` (VITE_ZITADEL_CLIENT_ID) |
| **Backend Client ID** | Applications → Backend → Client ID | `340439932633904189` | `.env` (ZITADEL_API_CLIENT_ID) |
| **API Key JSON** | Ficheiro descarregado | `zitadel-api-key.json` | Raiz do projeto |
| **Redirect URIs** | Applications → Frontend | `http://localhost:5173` e `http://localhost:5173/` | Configurado no Zitadel |
| **Post Logout URI** | Applications → Frontend | `http://localhost:5173/` | Configurado no Zitadel |

---

## Configuração do Ambiente Local

### Pré-requisitos

```bash
node --version  # >= 16.x
npm --version   # >= 8.x
```

Se Node.js não estiver instalado: https://nodejs.org/ (versão LTS)

---

### Ficheiro .env

Criar ficheiro `.env` na raiz do projeto:

```env
# Frontend Configuration
VITE_ZITADEL_ISSUER=https://test-qgqmqq.us1.zitadel.cloud
VITE_ZITADEL_CLIENT_ID=340415062625762377
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173
VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/
VITE_API_BASE_URL=http://localhost:3001

# Backend Configuration
PORT=3001
NODE_ENV=development

# Zitadel Backend API
ZITADEL_DOMAIN=https://test-qgqmqq.us1.zitadel.cloud
ZITADEL_API_CLIENT_ID=340439932633904189
ZITADEL_API_KEY_PATH=./zitadel-api-key.json

# Database
DB_PATH=./clicks.db
```

**Substituir valores:**
- `test-qgqmqq.us1.zitadel.cloud` → URL da instância Zitadel
- `340415062625762377` → Frontend Client ID
- `340439932633904189` → Backend Client ID

---

### Verificar API Key

```bash
# Windows
dir zitadel-api-key.json

# Linux/Mac
ls -la zitadel-api-key.json
```

Se não existir, voltar ao **Passo 4.5** da configuração Zitadel.

---

### Instalar Dependências

```bash
cd C:\Users\pedro.s.machado\Desktop\zitadel-testing
npm install
```

---

## Backend - Explicação Técnica

### Configuração da Base de Dados (server/config/database.js)

**SQLite3 usa callbacks por padrão. Convertemos para Promises para usar async/await.**

#### Funções Wrapper

```javascript
// INSERT, UPDATE, DELETE, CREATE
export const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

// SELECT - uma linha
export const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)  // objeto ou undefined
    })
  })
}

// SELECT - múltiplas linhas
export const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)  // array (vazio se sem resultados)
    })
  })
}
```

#### Schema da Base de Dados

```javascript
export const initDatabase = async () => {
  // Users - informação do Zitadel
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,              -- Zitadel user ID (JWT 'sub')
      email TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Clicks - eventos registados
  await runAsync(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Índice para performance
  await runAsync(`
    CREATE INDEX IF NOT EXISTS idx_clicks_user_id ON clicks(user_id)
  `)
}
```

---

### Middleware de Autenticação (server/middleware/auth.js)

#### JWT - Estrutura

```
eyJhbGc...  .  eyJpc3M...  .  SflKxw...
   ↑              ↑              ↑
 Header        Payload      Signature
```

**Header:**
```json
{
  "alg": "RS256",
  "kid": "123"
}
```

**Payload:**
```json
{
  "iss": "https://zitadel.cloud",
  "sub": "340414399188138712",
  "aud": "340415062625762377",
  "exp": 1759530272,
  "iat": 1759487072
}
```

**Signature:** RSA encryption de (Header + Payload) com chave privada do Zitadel.

#### Verificação com JWKS

```javascript
// Setup - buscar chaves públicas do Zitadel
const JWKS = createRemoteJWKSet(
  new URL(`${ZITADEL_ISSUER}/oauth/v2/keys`)
)

// Verificar token
async function verifyToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: ZITADEL_ISSUER,        // Valida quem emitiu
    audience: ZITADEL_CLIENT_ID    // Valida para quem é destinado
  })
  return payload
}
```

**Verificações automáticas:**
1. Assinatura válida (token não foi modificado)
2. Emitido pelo Zitadel correto (`iss`)
3. Destinado a esta aplicação (`aud`)
4. Não expirou (`exp` > agora)
5. Válido agora (`nbf` <= agora)

#### Middleware Principal

```javascript
export const authenticateZitadel = async (req, res, next) => {
  // 1. Extrair token
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token not provided' })

  const token = authHeader.split(' ')[1]

  // 2. Verificar assinatura e claims
  const payload = await verifyToken(token)

  // 3. Buscar dados completos do utilizador
  const userInfo = await getUserInfo(token)

  // 4. Adicionar a req.user
  req.user = {
    id: payload.sub,
    email: userInfo.email,
    name: userInfo.name,
    payload
  }

  // 5. Continuar
  next()
}
```

**Fluxo de verificação:**
```
Token recebido
      ↓
1. Decodificar Header
      ↓
2. Buscar chave pública (JWKS)
      ↓
3. Verificar assinatura
      ↓
4. Verificar claims (iss, aud, exp)
      ↓
5. Buscar UserInfo
      ↓
6. req.user = { id, email, name }
      ↓
7. next() → Rota
```

---

### Service Layer (server/services/clickService.js)

Camada de lógica de negócio - separa acesso a dados das rotas HTTP.

#### Métodos Principais

```javascript
class ClickService {
  // Garante que utilizador existe antes de inserir clicks
  async ensureUserExists(userId, email, name) {
    const existingUser = await getAsync(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    )

    if (!existingUser) {
      await runAsync(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        [userId, email, name]
      )
    }
  }

  // Registar novo click
  async recordClick(userId, email, name) {
    await this.ensureUserExists(userId, email, name)

    const result = await runAsync(
      'INSERT INTO clicks (user_id) VALUES (?)',
      [userId]
    )

    return {
      clickId: result.lastID,
      userId,
      timestamp: new Date().toISOString()
    }
  }

  // Contar clicks do utilizador
  async getUserClickCount(userId) {
    const result = await getAsync(
      'SELECT COUNT(*) as count FROM clicks WHERE user_id = ?',
      [userId]
    )
    return result ? result.count : 0
  }

  // Histórico de clicks
  async getUserClickHistory(userId, limit = 100) {
    const clicks = await allAsync(
      `SELECT id, clicked_at FROM clicks
       WHERE user_id = ?
       ORDER BY clicked_at DESC
       LIMIT ?`,
      [userId, limit]
    )

    return clicks.map(click => ({
      id: click.id,
      timestamp: click.clicked_at
    }))
  }

  // Apagar todos os clicks do utilizador
  async deleteUserClicks(userId) {
    const result = await runAsync(
      'DELETE FROM clicks WHERE user_id = ?',
      [userId]
    )
    return result.changes
  }
}
```

---

### Rotas da API (server/routes/clicks.js)

#### Endpoints Disponíveis

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/clicks` | Sim | Registar novo click |
| GET | `/api/clicks/count` | Sim | Obter contagem de clicks |
| GET | `/api/clicks/history?limit=N` | Sim | Obter histórico |
| GET | `/api/clicks/stats` | Sim | Estatísticas globais |
| GET | `/api/clicks/me` | Sim | Info do utilizador + contagem |
| DELETE | `/api/clicks/logout` | Sim | Apagar clicks do utilizador |

#### Exemplo de Rota

```javascript
router.post('/', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId, email, name } = req.user

    const result = await clickService.recordClick(userId, email, name)

    res.status(201).json({
      success: true,
      message: 'Click recorded successfully',
      data: result
    })
  } catch (error) {
    console.error('Error recording click:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record click'
    })
  }
})
```

---

## Frontend - Explicação Técnica

### Inicialização Vue + Zitadel (src/main.js)

```javascript
const zitadelConfig = {
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  issuer: import.meta.env.VITE_ZITADEL_ISSUER,
  scope: 'openid profile email'
}

const { oidcAuth } = createZITADELAuth(
  zitadelConfig,
  'zitadel',                          // authName para route guards
  0,                                  // cache timeout
  window.location.origin + '/'        // redirect URI
)

oidcAuth.useRouter(router)            // Adiciona route guards automáticos

const app = createApp(App)
app.provide('$oidcAuth', oidcAuth)    // Disponibiliza em toda a app

// Iniciar autenticação antes de montar app
oidcAuth.startup().then(() => {
  app.mount('#app')
})
```

**startup() processa:**
1. Verifica se há código OAuth no URL (`?code=xyz`)
2. Se sim, troca code por access_token
3. Define estado de autenticação
4. Retorna Promise → então monta app

---

### Router (src/router/index.js)

```javascript
const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
    // Rota pública
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/MainView.vue'),
    meta: { authName: 'zitadel' }  // Protegida
  }
]
```

**Route Guard Automático:**
- `meta: { authName: 'zitadel' }` → SDK verifica `isAuthenticated`
- Se não autenticado → redireciona para `/`

---

### Composable de Autenticação (src/composables/useAuth.js)

```javascript
export function useAuth() {
  const auth = inject('$oidcAuth')

  const login = async () => await auth.signIn()
  const logout = async () => await auth.signOut()
  const getToken = () => auth.accessToken

  const isAuthenticated = computed(() => auth.isAuthenticated)
  const currentUser = computed(() => auth.userProfile)

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    getToken
  }
}
```

**currentUser contém:**
```javascript
{
  sub: "340414399188138712",
  name: "Pedro Machado",
  email: "pedro@gmail.com",
  given_name: "Pedro",
  family_name: "Machado",
  preferred_username: "pedro.machado.work@gmail.com",
  email_verified: true
}
```

---

### Composable de API (src/composables/useClickApi.js)

```javascript
export function useClickApi() {
  const { getToken } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  const recordClick = async () => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.post(
        `${API_BASE_URL}/api/clicks`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTotalClicks = async () => {
    const token = getToken()
    const response = await axios.get(
      `${API_BASE_URL}/api/clicks/count`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    return response.data.data.totalClicks
  }

  return {
    recordClick,
    getTotalClicks,
    loading,
    error
  }
}
```

---

## Fluxos da Aplicação

### Fluxo de Login OAuth/OIDC

```
1. User acede http://localhost:5173
        ↓
2. Vue carrega LoginView.vue (rota pública)
        ↓
3. User clica "LOGIN WITH ZITADEL"
        ↓
4. auth.signIn() → SDK constrói URL OAuth:
   https://zitadel.cloud/oauth/v2/authorize?
     client_id=340...
     &redirect_uri=http://localhost:5173
     &scope=openid+profile+email
     &response_type=code
     &state=random123
     &code_challenge=xyz
     &code_challenge_method=S256
        ↓
5. Browser redireciona para Zitadel
        ↓
6. User autentica (email/password, Google, etc.)
        ↓
7. Zitadel valida credenciais → gera authorization code
        ↓
8. Zitadel redireciona de volta:
   http://localhost:5173?code=abc123&state=random123
        ↓
9. oidcAuth.startup() deteta callback OAuth
        ↓
10. SDK troca code por tokens (Token Endpoint):
    POST https://zitadel.cloud/oauth/v2/token
    {
      grant_type: "authorization_code",
      code: "abc123",
      redirect_uri: "http://localhost:5173",
      code_verifier: "xyz"  (PKCE)
    }
        ↓
11. Zitadel retorna:
    {
      access_token: "eyJhbGc...",
      id_token: "eyJhbGc...",
      refresh_token: "...",
      expires_in: 3600
    }
        ↓
12. SDK guarda tokens em memória
    auth.isAuthenticated = true
    auth.accessToken = "eyJhbGc..."
    auth.userProfile = { sub, name, email, ... }
        ↓
13. router.push('/main')
        ↓
14. Router verifica meta.authName → autenticado → carrega MainView
        ↓
15. MainView.vue → onMounted() → getTotalClicks()
        ↓
16. GET /api/clicks/count com Authorization: Bearer token
        ↓
17. Backend → authenticateZitadel:
    - Verifica assinatura (JWKS)
    - Busca UserInfo
    - req.user = { id, email, name }
        ↓
18. clickService.getUserClickCount(userId)
        ↓
19. Backend responde: { totalClicks: 0 }
        ↓
20. Frontend atualiza UI
```

---

### Fluxo de Click Event

```
1. User clica "CLICK ME"
        ↓
2. handleClick() → recordClick()
   loading.value = true
        ↓
3. getToken() → "eyJhbGc..."
        ↓
4. axios.post('/api/clicks', {}, {
     headers: { Authorization: 'Bearer eyJhbGc...' }
   })
        ↓
5. Backend: CORS → JSON Parser → Logger → Router
        ↓
6. authenticateZitadel:
   - Extrai token
   - Verifica assinatura (JWKS)
   - Verifica claims (iss, aud, exp)
   - Busca UserInfo
   - req.user = { id, email, name }
   - next()
        ↓
7. Route handler: req.user → clickService.recordClick()
        ↓
8. ensureUserExists() → INSERT INTO users (se não existir)
        ↓
9. INSERT INTO clicks (user_id) VALUES (?)
   SQLite retorna lastID: 1
        ↓
10. Backend responde:
    {
      success: true,
      data: { clickId: 1, userId: '340...', timestamp: '...' }
    }
        ↓
11. Frontend: loading.value = false
        ↓
12. getTotalClicks() → GET /api/clicks/count
        ↓
13. Backend: SELECT COUNT(*) → retorna 1
        ↓
14. Frontend: clickCount.value = 1
        ↓
15. Vue reatividade → template re-renderiza
```

---

## Base de Dados

### Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clicks_user_id ON clicks(user_id);
```

### Exemplo de Dados

**users:**

| id | email | name | created_at |
|----|-------|------|------------|
| 340414399188138712 | pedro@gmail.com | Pedro Machado | 2025-10-02 15:26:23 |
| 340435793090737213 | maria@gmail.com | Maria Silva | 2025-10-02 16:22:43 |

**clicks:**

| id | user_id | clicked_at |
|----|---------|------------|
| 1 | 340414399188138712 | 2025-10-03 10:23:44 |
| 2 | 340414399188138712 | 2025-10-03 10:23:45 |
| 3 | 340435793090737213 | 2025-10-03 10:24:10 |

---

## Execução

### Instalação

```bash
cd C:\Users\pedro.s.machado\Desktop\zitadel-testing
npm install
```

### Executar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

## Troubleshooting

### Erro: "Port already in use"

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Ou alterar porta em `vite.config.js`:**
```javascript
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true
  }
})
```

Atualizar `.env` e Zitadel Redirect URIs.

---

### Erro: "Invalid or expired token"

Token JWT expirou (lifetime: 1 hora).

**Solução:** Fazer logout e login novamente.

---

### Erro: "CORS error"

```
Access to XMLHttpRequest blocked by CORS policy
```

**Verificar `server/index.js`:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Deve incluir origem do frontend
    'http://localhost:5174'
  ],
  credentials: true
}))
```

Reiniciar backend.

---

### Problema: Nome mostra "User" em vez do nome real

**Causas possíveis:**

1. **Scope incorreto em `src/main.js`:**
   ```javascript
   scope: 'openid profile email'  // profile e email obrigatórios
   ```

2. **Backend não busca UserInfo** - verificar `server/middleware/auth.js` chama `getUserInfo()`

3. **Zitadel scopes desabilitados:**
   - Zitadel → Project Settings → Token Settings
   - Verificar `profile` e `email` habilitados

---

### Verificação de Segurança JWT

**Impossível forjar token porque:**
- Requer chave PRIVADA do Zitadel (nunca sai dos servidores)
- Qualquer modificação no payload invalida assinatura
- Backend verifica assinatura com chave PÚBLICA (JWKS)
- Criptografia RSA garante integridade

**Fluxo de verificação no backend:**
```
1. Recebe token
2. Decodifica header → obtém kid
3. Busca chave pública do Zitadel (JWKS)
4. Verifica assinatura
   hash(header + payload) == signature?
5. Verifica claims (iss, aud, exp, nbf)
6. Se tudo válido → req.user
```

---

## Recursos

- Zitadel Docs: https://zitadel.com/docs
- Vue 3: https://vuejs.org/
- Express: https://expressjs.com/
- OAuth 2.0: https://oauth.net/2/
- JWT.io: https://jwt.io/
- PKCE: https://oauth.net/2/pkce/

---

**Versão:** 2.0
**Data:** 2025-10-03
**Objetivo:** Documentação técnica para implementação de autenticação OAuth/OIDC com Zitadel em aplicações Vue 3 + Node.js
