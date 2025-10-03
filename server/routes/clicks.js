import express from 'express'
import clickService from '../services/clickService.js'
import authenticateZitadel from '../middleware/auth.js'

const router = express.Router()

/**
 * Click Tracking API Routes
 *
 * All routes in this file require Zitadel authentication.
 * The authenticateZitadel middleware adds req.user with:
 * - id: Zitadel user ID
 * - email: User email address
 * - name: User display name
 * - payload: Full JWT token payload
 */

/**
 * POST /api/clicks
 * Record a new click for the authenticated user
 *
 * Authentication: Required
 * Request body: None
 * Response: Click record with ID and timestamp
 */
router.post('/', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId, email, name } = req.user

    const result = await clickService.recordClick(userId, email, name)

    res.status(201).json({
      success: true,
      message: 'Click recorded successfully',
      data: result
    })
  } catch (error) {
    console.error('Error recording click:', error)
    res.status(500).json({
      success: false,
      error: 'Error recording click',
      message: error.message
    })
  }
})

/**
 * GET /api/clicks/count
 * Get total click count for the authenticated user
 *
 * Authentication: Required
 * Response: User ID and total click count
 */
router.get('/count', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId } = req.user

    const count = await clickService.getUserClickCount(userId)

    res.json({
      success: true,
      data: {
        userId,
        totalClicks: count
      }
    })
  } catch (error) {
    console.error('Error getting click count:', error)
    res.status(500).json({
      success: false,
      error: 'Error getting click count',
      message: error.message
    })
  }
})

/**
 * GET /api/clicks/history
 * Get click history for the authenticated user
 *
 * Authentication: Required
 * Query parameters:
 * - limit: Maximum number of results (default: 100, max: 1000)
 *
 * Response: Array of click records with timestamps
 */
router.get('/history', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId } = req.user
    const limit = parseInt(req.query.limit) || 100

    // Validate limit parameter
    if (limit < 1 || limit > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 1000'
      })
    }

    const history = await clickService.getUserClickHistory(userId, limit)

    res.json({
      success: true,
      data: {
        userId,
        clicks: history,
        count: history.length
      }
    })
  } catch (error) {
    console.error('Error getting click history:', error)
    res.status(500).json({
      success: false,
      error: 'Error getting click history',
      message: error.message
    })
  }
})

/**
 * GET /api/clicks/stats
 * Get global click statistics across all users
 *
 * Authentication: Required
 * Note: In production, restrict this to admin users only
 *
 * Response: Total clicks, total users, and top users by click count
 */
router.get('/stats', authenticateZitadel, async (req, res) => {
  try {
    const stats = await clickService.getGlobalStats()

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Error getting statistics',
      message: error.message
    })
  }
})

/**
 * GET /api/clicks/me
 * Get complete user information including click count
 *
 * Authentication: Required
 * Response: User profile data (id, email, name, created_at, totalClicks)
 */
router.get('/me', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId } = req.user

    const userInfo = await clickService.getUserInfo(userId)

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Could not find user information'
      })
    }

    res.json({
      success: true,
      data: userInfo
    })
  } catch (error) {
    console.error('Error getting user information:', error)
    res.status(500).json({
      success: false,
      error: 'Error getting user information',
      message: error.message
    })
  }
})

/**
 * DELETE /api/clicks/logout
 * Delete all clicks for the authenticated user
 *
 * Authentication: Required
 * Used when user logs out to reset their click history
 *
 * Response: Number of clicks deleted
 */
router.delete('/logout', authenticateZitadel, async (req, res) => {
  try {
    const { id: userId } = req.user

    const deletedCount = await clickService.deleteUserClicks(userId)

    res.json({
      success: true,
      message: 'User clicks deleted successfully',
      data: {
        deletedClicks: deletedCount
      }
    })
  } catch (error) {
    console.error('Error deleting clicks on logout:', error)
    res.status(500).json({
      success: false,
      error: 'Error deleting clicks',
      message: error.message
    })
  }
})

export default router
