// Zitadel authentication configuration
export const zitadelConfig = {
  issuer: import.meta.env.VITE_ZITADEL_ISSUER,
  clientId: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  redirectUri: import.meta.env.VITE_ZITADEL_REDIRECT_URI,
  postLogoutRedirectUri: import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI,
  scope: 'openid profile email',
  responseType: 'code',
  // PKCE is enabled by default in @zitadel/vue
  pkce: true
}

// Validate configuration
export function validateZitadelConfig() {
  const requiredEnvVars = [
    'VITE_ZITADEL_ISSUER',
    'VITE_ZITADEL_CLIENT_ID',
    'VITE_ZITADEL_REDIRECT_URI'
  ]

  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  )

  if (missing.length > 0) {
    console.error('Missing required Zitadel environment variables:', missing)
    return false
  }

  return true
}
