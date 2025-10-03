<template>
  <div class="main-container">
    <!-- Header with logout button -->
    <header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="logo-text">CLICK TRACKER</span>
        </div>

        <button class="icon-button logout-button" @click="handleLogout" title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main content with click button -->
    <main class="main-content">
      <div class="click-section">
        <!-- User info display -->
        <div class="user-info">
          <div class="user-info-row">
            <span class="user-label">USER ID:</span>
            <span class="user-value">{{ userId }}</span>
          </div>
          <div class="user-info-row">
            <span class="user-label">NAME:</span>
            <span class="user-value">{{ userName }}</span>
          </div>
        </div>

        <div class="counter-display">
          <span class="counter-label">CLICKS</span>
          <span class="counter-value">{{ clickCount }}</span>
        </div>

        <!-- Main click button and reset button -->
        <div class="button-group">
          <button class="click-button" @click="handleClick">
            <div class="button-content">
              <svg class="smile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <circle cx="9" cy="9" r="1" fill="currentColor"/>
                <circle cx="15" cy="9" r="1" fill="currentColor"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14s1.5 2 4 2 4-2 4-2"/>
              </svg>
              <span class="button-text">CLICK ME</span>
            </div>
          </button>

          <button class="reset-button" @click="handleReset" title="Reset clicks to 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="reset-text">RESET</span>
          </button>
        </div>

        <div class="info-text">
          <span>✅ Connected to backend - Clicks saved in database</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useClickApi } from '../composables/useClickApi'

const router = useRouter()
const { logout, currentUser } = useAuth()
const { recordClick, getTotalClicks, deleteAllClicks } = useClickApi()

const clickCount = ref(0)
const userId = ref('')
const userName = ref('')

// Load initial click count when component mounts
const loadClickCount = async () => {
  try {
    clickCount.value = await getTotalClicks()
  } catch (err) {
    console.error('Error loading click count:', err)
  }
}

// Load user info and clicks when component is mounted
onMounted(() => {
  if (currentUser.value) {
    userId.value = currentUser.value.sub || ''
    userName.value = currentUser.value.name || currentUser.value.preferred_username || 'User'
  }
  loadClickCount()
})

// Record click in backend
const handleClick = async () => {
  try {
    await recordClick()
    // Update count after recording
    clickCount.value = await getTotalClicks()
  } catch (err) {
    console.error('Error recording click:', err)
  }
}

const handleReset = async () => {
  try {
    // Delete all clicks from database
    await deleteAllClicks()

    // Reset click count display
    clickCount.value = 0
  } catch (err) {
    console.error('Reset failed:', err)
  }
}

const handleLogout = async () => {
  try {
    // Reset click count display (don't delete from database)
    clickCount.value = 0

    // Logout from Zitadel
    await logout()
    // Zitadel will handle the redirect to post logout URI
  } catch (err) {
    console.error('Logout failed:', err)
    // Fallback: redirect to login anyway
    clickCount.value = 0
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
}

.main-header {
  background: rgba(26, 26, 46, 0.6);
  border-bottom: 2px solid #ff6ec7;
  backdrop-filter: blur(10px);
  padding: 20px 40px;
  box-shadow: 0 4px 20px rgba(255, 110, 199, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff6ec7;
  text-shadow: 0 0 10px rgba(255, 110, 199, 0.6);
}

.icon-button {
  width: 50px;
  height: 50px;
  border: 2px solid #00d4ff;
  border-radius: 4px;
  background: rgba(0, 212, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
}

.icon-button:hover {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.icon-button svg {
  width: 24px;
  height: 24px;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.click-section {
  text-align: center;
}

.user-info {
  background: rgba(26, 26, 46, 0.6);
  border: 2px solid #00d4ff;
  border-radius: 8px;
  padding: 20px 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.user-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info-row:last-child {
  margin-bottom: 0;
}

.user-label {
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: #00d4ff;
  font-weight: 600;
}

.user-value {
  font-size: 0.95rem;
  color: #ff6ec7;
  font-weight: 500;
  letter-spacing: 1px;
  word-break: break-all;
}

.counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.counter-label {
  font-size: 1.2rem;
  letter-spacing: 3px;
  color: #00d4ff;
  margin-bottom: 10px;
}

.counter-value {
  font-size: 4rem;
  font-weight: 700;
  color: #ff6ec7;
  text-shadow: 0 0 20px rgba(255, 110, 199, 0.6);
  min-width: 150px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.click-button {
  width: 300px;
  height: 300px;
  border: 4px solid #ff6ec7;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 110, 199, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 40px rgba(255, 110, 199, 0.4), 0 0 60px rgba(0, 212, 255, 0.3);
  backdrop-filter: blur(10px);
}

.click-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 60px rgba(255, 110, 199, 0.6), 0 0 80px rgba(0, 212, 255, 0.5);
  background: linear-gradient(135deg, rgba(255, 110, 199, 0.3) 0%, rgba(0, 212, 255, 0.3) 100%);
}

.click-button:active {
  transform: scale(0.98);
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.smile-icon {
  width: 100px;
  height: 100px;
  color: #00d4ff;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

.button-text {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff6ec7;
  text-shadow: 0 0 10px rgba(255, 110, 199, 0.6);
}

.reset-button {
  width: 120px;
  height: 120px;
  border: 3px solid #00d4ff;
  border-radius: 4px;
  background: rgba(0, 212, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  backdrop-filter: blur(10px);
}

.reset-button:hover {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
}

.reset-button:active {
  transform: translateY(0);
}

.reset-button svg {
  width: 40px;
  height: 40px;
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
}

.reset-text {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00d4ff;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}

.info-text {
  color: #00d4ff;
  font-size: 0.9rem;
  letter-spacing: 1px;
  opacity: 0.7;
}
</style>
