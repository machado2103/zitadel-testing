<template>
  <div class="callback-container">
    <div class="callback-card">
      <div class="loader-wrapper">
        <div class="loader"></div>
      </div>
      <h2 class="callback-title">{{ message }}</h2>
      <p class="callback-text" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useZitadelAuth } from '@zitadel/vue'

const router = useRouter()
const zitadelAuth = useZitadelAuth()

const message = ref('Processing authentication...')
const error = ref(null)

onMounted(async () => {
  try {
    // Handle the OAuth callback and exchange code for tokens
    await zitadelAuth.handleCallback()

    message.value = 'Authentication successful!'

    // Wait a moment before redirecting
    setTimeout(() => {
      router.push({ name: 'Main' })
    }, 1000)
  } catch (err) {
    console.error('Authentication callback error:', err)
    message.value = 'Authentication failed'
    error.value = err.message || 'An error occurred during authentication'

    // Redirect to login after showing error
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 3000)
  }
})
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
  padding: 20px;
}

.callback-card {
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #ff6ec7;
  border-radius: 8px;
  padding: 60px 80px;
  box-shadow: 0 0 40px rgba(255, 110, 199, 0.3), 0 0 80px rgba(0, 212, 255, 0.2);
  min-width: 500px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.loader-wrapper {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.loader {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 212, 255, 0.2);
  border-top: 4px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.callback-title {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff6ec7;
  text-shadow: 0 0 10px rgba(255, 110, 199, 0.6);
  margin: 0 0 15px 0;
}

.callback-text {
  color: #00d4ff;
  font-size: 1rem;
  letter-spacing: 1px;
  margin: 0;
}
</style>
