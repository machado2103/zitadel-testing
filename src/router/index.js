import { createRouter, createWebHistory } from 'vue-router'

/**
 * Application Routes
 *
 * Route configuration for the Vue application.
 * Uses lazy loading (dynamic imports) for better performance.
 *
 * Route Protection:
 * Routes with meta.authName = 'zitadel' are protected by authentication.
 * The @zitadel/vue SDK automatically adds navigation guards to enforce this.
 */
const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/MainView.vue'),
    // meta.authName tells the Zitadel SDK to protect this route
    // Users must be authenticated to access this page
    meta: { authName: 'zitadel' }
  }
]

/**
 * Create Router Instance
 *
 * Uses HTML5 history mode for clean URLs without hash (#).
 * This requires server-side configuration to handle client-side routing.
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
