import { createApp } from 'vue'
import { createZITADELAuth } from '@zitadel/vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Zitadel configuration
const zitadelConfig = {
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  issuer: import.meta.env.VITE_ZITADEL_ISSUER
}

// Validate Zitadel configuration
if (!zitadelConfig.client_id || !zitadelConfig.issuer) {
  console.error('Zitadel configuration is invalid. Please check your .env file.')
  console.error('Missing:', {
    client_id: !zitadelConfig.client_id,
    issuer: !zitadelConfig.issuer
  })
}

// Create Zitadel auth instance
const mainAppUrl = window.location.origin + '/'
const { oidcAuth } = createZITADELAuth(
  zitadelConfig,
  'zitadel',
  0, // SignInType.Window
  mainAppUrl
)

// Configure OIDC router before creating the app
oidcAuth.useRouter(router)

const app = createApp(App)

// Make auth available globally
app.config.globalProperties.$oidcAuth = oidcAuth
window.$oidcAuth = oidcAuth

// Provide auth to all components
app.provide('$oidcAuth', oidcAuth)

app.use(router)

// Start auth and mount app
oidcAuth.startup().then(() => {
  console.log('OIDC startup complete, auth:', oidcAuth)
  console.log('isAuthenticated:', oidcAuth.isAuthenticated)
  app.mount('#app')
})
