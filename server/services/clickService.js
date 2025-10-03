import { runAsync, getAsync, allAsync } from '../config/database.js'

/**
 * Click Service
 *
 * Business logic layer for click tracking functionality.
 * Handles all database operations related to users and clicks.
 *
 * This service follows the Repository pattern, isolating database
 * operations from the route handlers and providing a clean API
 * for the application logic.
 */
class ClickService {
  /**
   * Ensure user exists in database
   *
   * Checks if a user with the given ID exists in the database.
   * If not, creates a new user record with the provided information.
   *
   * This is called automatically before recording clicks to ensure
   * the foreign key relationship is valid.
   *
   * @param {string} userId - Zitadel user ID (from JWT 'sub' claim)
   * @param {string} email - User email address
   * @param {string} name - User display name
   * @throws {Error} If database operation fails
   */
  async ensureUserExists(userId, email, name) {
    try {
      // Check if user already exists
      const existingUser = await getAsync(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      )

      if (!existingUser) {
        // Create new user record
        await runAsync(
          'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
          [userId, email, name]
        )
        console.log(`New user: ${name}`)
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error)
      throw new Error('Error processing user data')
    }
  }

  /**
   * Record a click event
   *
   * Creates a new click record in the database for the specified user.
   * Automatically ensures the user exists before recording the click.
   *
   * @param {string} userId - Zitadel user ID
   * @param {string} email - User email address
   * @param {string} name - User display name
   * @returns {Promise<object>} Click record with ID and timestamp
   * @throws {Error} If database operation fails
   */
  async recordClick(userId, email, name) {
    try {
      // Ensure user exists in database (create if needed)
      await this.ensureUserExists(userId, email, name)

      // Insert click record
      const result = await runAsync(
        'INSERT INTO clicks (user_id) VALUES (?)',
        [userId]
      )

      return {
        clickId: result.lastID,
        userId,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error recording click:', error)
      throw new Error('Error recording click')
    }
  }

  /**
   * Get total click count for a user
   *
   * @param {string} userId - Zitadel user ID
   * @returns {Promise<number>} Total number of clicks by this user
   * @throws {Error} If database operation fails
   */
  async getUserClickCount(userId) {
    try {
      const result = await getAsync(
        'SELECT COUNT(*) as count FROM clicks WHERE user_id = ?',
        [userId]
      )

      return result ? result.count : 0
    } catch (error) {
      console.error('Error getting click count:', error)
      throw new Error('Error getting click count')
    }
  }

  /**
   * Get click history for a user
   *
   * Returns recent click events for the specified user,
   * ordered by most recent first.
   *
   * @param {string} userId - Zitadel user ID
   * @param {number} limit - Maximum number of results (default: 100)
   * @returns {Promise<array>} Array of click objects with id and timestamp
   * @throws {Error} If database operation fails
   */
  async getUserClickHistory(userId, limit = 100) {
    try {
      const clicks = await allAsync(
        `SELECT id, clicked_at
         FROM clicks
         WHERE user_id = ?
         ORDER BY clicked_at DESC
         LIMIT ?`,
        [userId, limit]
      )

      // Transform database rows to clean API response format
      return clicks.map(click => ({
        id: click.id,
        timestamp: click.clicked_at
      }))
    } catch (error) {
      console.error('Error getting click history:', error)
      throw new Error('Error getting click history')
    }
  }

  /**
   * Get global click statistics
   *
   * Returns aggregate statistics across all users.
   * Useful for admin dashboards or analytics.
   *
   * Note: In production, this should be restricted to admin users only.
   *
   * @returns {Promise<object>} Statistics object containing:
   *   - totalClicks: Total number of clicks across all users
   *   - totalUsers: Total number of registered users
   *   - topUsers: Array of top 5 users by click count
   * @throws {Error} If database operation fails
   */
  async getGlobalStats() {
    try {
      // Get total clicks
      const totalClicks = await getAsync(
        'SELECT COUNT(*) as count FROM clicks'
      )

      // Get total users
      const totalUsers = await getAsync(
        'SELECT COUNT(*) as count FROM users'
      )

      // Get top 5 users by click count
      const topUsers = await allAsync(
        `SELECT
          u.email,
          u.name,
          COUNT(c.id) as click_count
         FROM users u
         LEFT JOIN clicks c ON u.id = c.user_id
         GROUP BY u.id
         ORDER BY click_count DESC
         LIMIT 5`
      )

      return {
        totalClicks: totalClicks.count,
        totalUsers: totalUsers.count,
        topUsers: topUsers.map(user => ({
          email: user.email,
          name: user.name,
          clicks: user.click_count
        }))
      }
    } catch (error) {
      console.error('Error getting global statistics:', error)
      throw new Error('Error getting global statistics')
    }
  }

  /**
   * Get complete user information
   *
   * Retrieves user profile data along with their total click count.
   *
   * @param {string} userId - Zitadel user ID
   * @returns {Promise<object|null>} User data object or null if not found
   * @throws {Error} If database operation fails
   */
  async getUserInfo(userId) {
    try {
      const user = await getAsync(
        'SELECT id, email, name, created_at FROM users WHERE id = ?',
        [userId]
      )

      if (!user) {
        return null
      }

      // Get click count for this user
      const clickCount = await this.getUserClickCount(userId)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        totalClicks: clickCount
      }
    } catch (error) {
      console.error('Error getting user information:', error)
      throw new Error('Error getting user information')
    }
  }

  /**
   * Delete all clicks for a user
   *
   * Removes all click records for the specified user.
   * Called when user logs out or wants to reset their data.
   *
   * Note: This does NOT delete the user record, only the clicks.
   *
   * @param {string} userId - Zitadel user ID
   * @returns {Promise<number>} Number of clicks deleted
   * @throws {Error} If database operation fails
   */
  async deleteUserClicks(userId) {
    try {
      const result = await runAsync(
        'DELETE FROM clicks WHERE user_id = ?',
        [userId]
      )

      return result.changes
    } catch (error) {
      console.error('Error deleting user clicks:', error)
      throw new Error('Error deleting user clicks')
    }
  }
}

// Export a singleton instance of the service
// This ensures all parts of the application use the same instance
export default new ClickService()
