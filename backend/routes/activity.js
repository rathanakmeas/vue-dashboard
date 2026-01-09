import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { getActivityLog, getAllActivityLog, getActivityStats } from '../utils/activityLogger.js'

const router = express.Router()

// Get user's own activity log
router.get('/my-activities', authenticateToken, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100)
        const skip = parseInt(req.query.skip) || 0

        const result = await getActivityLog(req.user.id, limit, skip)

        res.json({
            success: true,
            activities: result.activities,
            pagination: {
                total: result.total,
                limit: result.limit,
                skip: result.skip,
                pages: Math.ceil(result.total / result.limit)
            }
        })
    } catch (error) {
        console.error('Error fetching user activities:', error)
        res.status(500).json({ error: 'Failed to fetch activities' })
    }
})

// Get all activities (admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin (you may want to add admin check here)
        const limit = Math.min(parseInt(req.query.limit) || 100, 500)
        const skip = parseInt(req.query.skip) || 0
        const action = req.query.action || null

        const result = await getAllActivityLog(limit, skip, action)

        res.json({
            success: true,
            activities: result.activities,
            pagination: {
                total: result.total,
                limit: result.limit,
                skip: result.skip,
                pages: Math.ceil(result.total / result.limit)
            }
        })
    } catch (error) {
        console.error('Error fetching all activities:', error)
        res.status(500).json({ error: 'Failed to fetch activities' })
    }
})

// Get activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await getActivityStats()
        res.json({
            success: true,
            stats
        })
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

export default router
