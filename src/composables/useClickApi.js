import { ref } from 'vue'
import { useAuth } from './useAuth'
import axios from 'axios'

// API base URL from environment variable (defaults to localhost:3001)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Click API Composable
 *
 * Provides methods for interacting with the click tracking API.
 * All requests are automatically authenticated using JWT tokens from Zitadel.
 *
 * Usage in components:
 * import { useClickApi } from '@/composables/useClickApi'
 * const { recordClick, getTotalClicks, loading, error } = useClickApi()
 *
 * @returns {object} API methods and reactive state
 */
export function useClickApi() {
  const { getToken } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  /**
   * Record a new click
   *
   * Sends a POST request to the backend to record a click event.
   * The backend will automatically associate the click with the authenticated user.
   *
   * @returns {Promise<object>} Click record with ID and timestamp
   * @throws {Error} If the request fails
   */
  const recordClick = async () => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.post(
        `${API_BASE_URL}/api/clicks`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error recording click:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get click history
   *
   * Retrieves the user's click history from the backend.
   *
   * @param {number} limit - Maximum number of results to return (default: 100)
   * @returns {Promise<array>} Array of click records with timestamps
   * @throws {Error} If the request fails
   */
  const getClickHistory = async (limit = 100) => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.get(
        `${API_BASE_URL}/api/clicks/history?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.data.clicks
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error getting history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get total click count
   *
   * Retrieves the total number of clicks for the authenticated user.
   *
   * @returns {Promise<number>} Total click count
   */
  const getTotalClicks = async () => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.get(
        `${API_BASE_URL}/api/clicks/count`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.data.totalClicks
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error getting count:', err)
      return 0
    } finally {
      loading.value = false
    }
  }

  /**
   * Get global statistics
   *
   * Retrieves aggregate statistics across all users.
   * Useful for admin dashboards.
   *
   * @returns {Promise<object>} Statistics object
   * @throws {Error} If the request fails
   */
  const getGlobalStats = async () => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.get(
        `${API_BASE_URL}/api/clicks/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error getting statistics:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete all user clicks
   *
   * Removes all click records for the authenticated user.
   * Typically called when the user wants to reset their data.
   *
   * @returns {Promise<object>} Response with number of deleted clicks
   * @throws {Error} If the request fails
   */
  const deleteAllClicks = async () => {
    loading.value = true
    error.value = null

    try {
      const token = getToken()

      const response = await axios.delete(
        `${API_BASE_URL}/api/clicks/logout`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error deleting clicks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    recordClick,
    getClickHistory,
    getTotalClicks,
    getGlobalStats,
    deleteAllClicks,
    loading,
    error
  }
}
