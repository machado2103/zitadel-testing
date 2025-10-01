import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/MainView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard to protect authenticated routes
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login' })
  }
  // Redirect to main if already authenticated and trying to access login
  else if (to.meta.requiresGuest && isAuthenticated.value) {
    next({ name: 'Main' })
  }
  else {
    next()
  }
})

export default router
