import Activity from '../models/Activity.js'

export const logActivity = async (userId, action, resourceType, resourceId = null, metadata = null, ipAddress = null, userAgent = null) => {
    try {
        const activity = new Activity({
            userId,
            action,
            resourceType,
            resourceId,
            metadata,
            ipAddress,
            userAgent,
            status: 'SUCCESS'
        })
        await activity.save()
        return activity
    } catch (error) {
        console.error('Error logging activity:', error)
    }
}

export const getActivityLog = async (userId, limit = 50, skip = 0) => {
    try {
        const activities = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('userId', 'username email')

        const total = await Activity.countDocuments({ userId })

        return {
            activities,
            total,
            limit,
            skip
        }
    } catch (error) {
        console.error('Error fetching activity log:', error)
        throw error
    }
}

export const getAllActivityLog = async (limit = 100, skip = 0, action = null) => {
    try {
        const filter = action ? { action } : {}
        const activities = await Activity.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('userId', 'username email firstName lastName')

        const total = await Activity.countDocuments(filter)

        return {
            activities,
            total,
            limit,
            skip
        }
    } catch (error) {
        console.error('Error fetching activity log:', error)
        throw error
    }
}

export const getActivityStats = async () => {
    try {
        const stats = await Activity.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ])

        return stats
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        throw error
    }
}
