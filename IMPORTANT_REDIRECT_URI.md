# ⚠️ IMPORTANTE: Configuração do Redirect URI

## Problema Detetado

Notei que tens configurados dois redirect URIs diferentes no Zitadel:
1. `http://localhost:5173/auth/signinwin/zitadel` ❌
2. `http://localhost:3000` ❌

Mas a aplicação Vue 3 está configurada para usar:
- **`http://localhost:5173/auth/callback`** ✅

## ✅ Solução: Atualizar no Zitadel

### Passo 1: Aceder ao Zitadel Console
1. Vai para https://test-qgqmqq.us1.zitadel.cloud
2. Faz login
3. Vai ao teu projeto
4. Clica na tua aplicação (Client ID: 340415062625762377)

### Passo 2: Atualizar Redirect URIs
Na secção **Redirect URIs**, adiciona (ou substitui):
```
http://localhost:5173/auth/callback
```

### Passo 3: Verificar Post Logout URIs
Na secção **Post Logout URIs**, confirma que tens:
```
http://localhost:3000/
```
OU
```
http://localhost:5173/
```

### Passo 4: Guardar as Alterações

---

## 🔍 Porquê estas URLs?

### Porta 3000 vs 5173
- **Vite (build tool)** usa por padrão a porta **5173**
- A porta **3000** é usada tradicionalmente por outras frameworks (Next.js, Create React App, etc.)
- A tua aplicação Vue+Vite vai correr em `http://localhost:5173`

### `/auth/callback`
- É a rota criada em `src/router/index.js` para processar o OAuth callback
- Esta rota é pública (não requer autenticação)
- Processa o código de autorização do Zitadel e troca por tokens

---

## 📋 Checklist Final

Antes de executar `npm run dev`, verifica:

- [ ] Redirect URI no Zitadel: `http://localhost:5173/auth/callback`
- [ ] Post Logout URI no Zitadel: `http://localhost:5173/` ou `http://localhost:3000/`
- [ ] Ficheiro `.env` existe e tem as credenciais corretas
- [ ] `npm install` foi executado
- [ ] Grant Type "Authorization Code" está habilitado no Zitadel
- [ ] PKCE está habilitado (recomendado)

---

## 🚀 Testar a Aplicação

```bash
cd zitadel-testing
npm run dev
```

Abre o browser em: **http://localhost:5173**

Clica em **"LOGIN WITH ZITADEL"** e deverás ser redirecionado para a página de login do Zitadel.

---

## 🐛 Se ainda não funcionar...

1. **Verifica a consola do browser (F12 → Console)**
   - Procura por erros de CORS ou redirect_uri mismatch

2. **Verifica os logs do Zitadel**
   - Vai ao Zitadel console → Authentication Logs
   - Procura por tentativas de login falhadas

3. **Testa com uma porta diferente**
   Se preferires usar a porta 3000, altera o `vite.config.js`:
   ```javascript
   export default defineConfig({
     plugins: [vue()],
     server: {
       port: 3000
     }
   })
   ```

   E depois atualiza o `.env`:
   ```env
   VITE_ZITADEL_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

---

**Qualquer dúvida, verifica o ficheiro `ZITADEL_SETUP.md`!** 📚
