<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="icon-wrapper">
          <svg class="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="login-title">SECURE ACCESS</h1>
      </div>

      <div class="login-actions">
        <!-- TODO: Integrate Zitadel authentication here -->
        <!-- This button will trigger Zitadel OAuth flow -->
        <button class="retro-button primary" @click="handleLogin">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>LOGIN</span>
        </button>

        <!-- Temporary bypass button for development -->
        <button class="retro-button secondary" @click="handleBypass">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span>DEV BYPASS</span>
        </button>
      </div>

      <div class="login-footer">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <span>SYSTEM READY</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

// TODO: Replace with actual Zitadel authentication
// This function will initiate the Zitadel OAuth flow
// Example: await zitadelClient.authorize()
const handleLogin = async () => {
  console.log('Login clicked - Zitadel integration pending')
  // Placeholder for Zitadel login logic
  login()
  router.push({ name: 'Main' })
}

// Temporary bypass for development
const handleBypass = () => {
  login()
  router.push({ name: 'Main' })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
  padding: 20px;
}

.login-card {
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #ff6ec7;
  border-radius: 8px;
  padding: 60px 80px;
  box-shadow: 0 0 40px rgba(255, 110, 199, 0.3), 0 0 80px rgba(0, 212, 255, 0.2);
  min-width: 500px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.login-header {
  margin-bottom: 50px;
}

.icon-wrapper {
  margin-bottom: 20px;
}

.auth-icon {
  width: 80px;
  height: 80px;
  color: #00d4ff;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

.login-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: #ff6ec7;
  text-shadow: 0 0 10px rgba(255, 110, 199, 0.6), 0 0 20px rgba(255, 110, 199, 0.4);
  margin: 0;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.retro-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 36px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 2px;
  border: 3px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

.retro-button.primary {
  background: linear-gradient(135deg, #ff6ec7 0%, #ff0080 100%);
  border-color: #ff6ec7;
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 110, 199, 0.4);
}

.retro-button.primary:hover {
  background: linear-gradient(135deg, #ff8ad4 0%, #ff1a8c 100%);
  box-shadow: 0 0 30px rgba(255, 110, 199, 0.6);
  transform: translateY(-2px);
}

.retro-button.secondary {
  background: linear-gradient(135deg, #00d4ff 0%, #0080ff 100%);
  border-color: #00d4ff;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}

.retro-button.secondary:hover {
  background: linear-gradient(135deg, #1adfff 0%, #1a8cff 100%);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
}

.button-icon {
  width: 24px;
  height: 24px;
}

.login-footer {
  display: flex;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00d4ff;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
