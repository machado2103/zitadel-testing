import { computed, inject } from 'vue'

export function useAuth() {
  const auth = inject('$oidcAuth')

  if (!auth) {
    throw new Error('OIDC Auth not provided. Make sure you called app.use() with the auth instance.')
  }

  /**
   * Initiate Zitadel OAuth login flow
   */
  const login = async () => {
    try {
      await auth.signIn()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Logout from Zitadel and clear session
   */
  const logout = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  /**
   * Get current access token for API calls
   */
  const getToken = () => {
    return auth.accessToken
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => {
    const result = auth.isAuthenticated
    console.log('isAuthenticated computed:', result, 'auth object:', auth)
    return result
  })

  /**
   * Get current user information
   */
  const currentUser = computed(() => {
    return auth.userProfile
  })

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    getToken
  }
}
