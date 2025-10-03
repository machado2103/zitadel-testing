import { computed, inject } from 'vue'

/**
 * Authentication Composable
 *
 * Provides authentication functionality for Vue components.
 * Wraps the @zitadel/vue SDK to provide a clean, reusable API.
 *
 * Usage in components:
 * import { useAuth } from '@/composables/useAuth'
 * const { isAuthenticated, currentUser, login, logout } = useAuth()
 *
 * @returns {object} Authentication methods and state
 */
export function useAuth() {
  // Inject the OIDC auth instance provided in main.js
  const auth = inject('$oidcAuth')

  if (!auth) {
    throw new Error('OIDC Auth not provided. Make sure Zitadel is initialized in main.js')
  }

  /**
   * Initiate login flow
   *
   * Redirects user to Zitadel login page.
   * After successful login, Zitadel redirects back to the application.
   * The @zitadel/vue SDK handles the OAuth callback automatically.
   */
  const login = async () => {
    await auth.signIn()
  }

  /**
   * Logout current user
   *
   * Clears local session and redirects to Zitadel logout endpoint.
   * Zitadel will then redirect back to the post_logout_redirect_uri.
   */
  const logout = async () => {
    await auth.signOut()
  }

  /**
   * Get current access token
   *
   * Returns the JWT access token for making authenticated API calls.
   * This token should be sent in the Authorization header as "Bearer <token>".
   *
   * @returns {string|null} JWT access token or null if not authenticated
   */
  const getToken = () => auth.accessToken

  /**
   * Check if user is authenticated
   *
   * Reactive computed property that updates when auth state changes.
   * Use this in templates to show/hide elements based on auth status.
   */
  const isAuthenticated = computed(() => auth.isAuthenticated)

  /**
   * Current user profile
   *
   * Reactive computed property containing user information from Zitadel:
   * - sub: Unique user ID
   * - name: Full name
   * - given_name: First name
   * - family_name: Last name
   * - email: Email address
   * - preferred_username: Username
   *
   * Returns null if user is not authenticated.
   */
  const currentUser = computed(() => auth.userProfile)

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    getToken
  }
}
