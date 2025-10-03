# Zitadel Integration Setup Guide

## ✅ Completed Integration

A integração do Zitadel foi completada com sucesso! Aqui está o que foi configurado:

### Ficheiros Criados/Atualizados:

1. **`.env`** - Variáveis de ambiente com as tuas credenciais Zitadel
2. **`src/config/zitadel.js`** - Configuração do cliente Zitadel
3. **`src/main.js`** - Inicialização do Zitadel provider
4. **`src/composables/useAuth.js`** - Lógica de autenticação usando Zitadel SDK
5. **`src/views/CallbackView.vue`** - Página para processar OAuth callback
6. **`src/views/LoginView.vue`** - Atualizada para usar login Zitadel
7. **`src/views/MainView.vue`** - Atualizada para usar logout Zitadel
8. **`src/router/index.js`** - Adicionada rota `/auth/callback`

---

## 🔧 Configuração no Zitadel

**IMPORTANTE:** Verifica se tens estas configurações no teu projeto Zitadel:

### Redirect URIs (devem estar configurados):
```
http://localhost:5173/auth/callback
```

### Post Logout Redirect URIs:
```
http://localhost:3000/
```

### Grant Types permitidos:
- ✅ Authorization Code
- ✅ Refresh Token (opcional)

### Token Settings:
- ✅ PKCE habilitado (recomendado)

---

## 🚀 Como Executar

### 1. Instalar dependências (se ainda não o fizeste):
```bash
cd zitadel-testing
npm install
```

### 2. Verificar o ficheiro `.env`:
O ficheiro `.env` já foi criado com as tuas credenciais:
```env
VITE_ZITADEL_ISSUER=https://test-qgqmqq.us1.zitadel.cloud
VITE_ZITADEL_CLIENT_ID=340415062625762377
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/
```

### 3. Executar a aplicação:
```bash
npm run dev
```

A aplicação irá abrir em: **http://localhost:5173**

---

## 🔐 Fluxo de Autenticação

1. **Login:**
   - Utilizador clica em "LOGIN WITH ZITADEL"
   - Redirect para a página de login do Zitadel
   - Utilizador faz login no Zitadel
   - Zitadel redireciona de volta para `http://localhost:5173/auth/callback`
   - Callback processa o código OAuth e obtém tokens
   - Utilizador é redirecionado para `/main`

2. **Logout:**
   - Utilizador clica no botão de logout
   - Sessão é limpa
   - Redirect para a página de logout do Zitadel
   - Zitadel redireciona para `http://localhost:3000/`

---

## 🐛 Troubleshooting

### Erro: "Redirect URI not allowed"
**Solução:** Verifica se `http://localhost:5173/auth/callback` está na lista de Redirect URIs no Zitadel.

### Erro: "Invalid client"
**Solução:** Verifica se o Client ID no `.env` está correto.

### Erro: "CORS error"
**Solução:** Certifica-te que o Zitadel permite requests do `http://localhost:5173`.

### Página em branco após login
**Solução:**
1. Abre as DevTools do browser (F12)
2. Vai à tab Console
3. Verifica se há erros
4. Confirma que o callback está a processar corretamente

### A aplicação não inicia
**Solução:**
```bash
# Limpa node_modules e reinstala
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📝 Próximos Passos

### 1. Testar Roles (User vs Admin)
Atualmente, a aplicação só verifica se o utilizador está autenticado. Se quiseres distinguir entre `user` e `admin`:

```javascript
// Em useAuth.js, adiciona:
const hasRole = (role) => {
  const user = currentUser.value
  if (!user || !user.roles) return false
  return user.roles.includes(role)
}

const isAdmin = computed(() => hasRole('admin'))
```

### 2. Backend Integration
O próximo passo seria conectar o backend para guardar os clicks:

- Criar API endpoints protegidos com Zitadel tokens
- Usar `getToken()` do `useAuth` para enviar tokens nas requests
- Implementar `useClickApi.js` completamente

### 3. Proteger Rotas por Role
```javascript
// No router guard:
if (to.meta.requiresAdmin && !isAdmin.value) {
  next({ name: 'Forbidden' })
}
```

---

## 📚 Documentação Útil

- [Zitadel Vue SDK](https://www.npmjs.com/package/@zitadel/vue)
- [Zitadel Documentation](https://zitadel.com/docs)
- [OAuth 2.0 / OIDC Flow](https://oauth.net/2/)

---

## ✨ O Que Mudou

### Antes (Mock):
```javascript
const login = () => {
  isLoggedIn.value = true
  user.value = { id: 'mock-user-id', email: 'user@example.com' }
}
```

### Agora (Zitadel Real):
```javascript
const login = async () => {
  await zitadel.login() // Redireciona para Zitadel
}
```

---

**Criado automaticamente pela integração Zitadel** 🚀
