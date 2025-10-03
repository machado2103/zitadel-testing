import { createApp } from 'vue'
import { createZITADELAuth } from '@zitadel/vue'
import App from './App.vue'
import router from './router'
import './style.css'

/**
 * Zitadel OAuth Configuration
 *
 * Configures the OIDC/OAuth authentication flow with Zitadel.
 * The scope parameter requests additional user information beyond just authentication:
 * - openid: Required for OIDC, provides user ID
 * - profile: Requests user profile data (name, given_name, family_name, etc.)
 * - email: Requests user email address
 */
const zitadelConfig = {
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  issuer: import.meta.env.VITE_ZITADEL_ISSUER,
  scope: 'openid profile email'
}

/**
 * Initialize Zitadel Authentication
 *
 * Creates the OIDC authentication handler with:
 * - config: OAuth configuration from environment variables
 * - 'zitadel': Auth name (used in route meta for protection)
 * - 0: Cache timeout (0 = no caching)
 * - redirect_uri: Where Zitadel redirects after login
 */
const { oidcAuth } = createZITADELAuth(
  zitadelConfig,
  'zitadel',
  0,
  window.location.origin + '/'
)

// Connect router with authentication
// This enables automatic route guards for protected routes
oidcAuth.useRouter(router)

// Create Vue application instance
const app = createApp(App)

// Make auth available to all components via global property
app.config.globalProperties.$oidcAuth = oidcAuth

// Provide auth to all components via composition API
// This allows using inject('$oidcAuth') in components
app.provide('$oidcAuth', oidcAuth)

// Register Vue Router
app.use(router)

/**
 * Start authentication and mount app
 *
 * oidcAuth.startup() performs initial authentication check:
 * - Checks for existing session
 * - Handles OAuth callback if present in URL
 * - Sets up authentication state
 *
 * Only after this completes do we mount the Vue app
 */
oidcAuth.startup().then(() => {
  app.mount('#app')
})
