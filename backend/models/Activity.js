import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'FILE_UPLOAD', 'FILE_DELETE', 'FOLDER_CREATE', 'FOLDER_UPDATE', 'FOLDER_DELETE', 'FOLDER_SHARE', 'PROFILE_UPDATE'],
        required: true
    },
    resourceType: {
        type: String,
        enum: ['USER', 'FILE', 'FOLDER', 'PROFILE'],
        required: true
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    description: String,
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed, // Store additional data like file name, folder name, etc.
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
})

// Index for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 })
activitySchema.index({ action: 1, createdAt: -1 })
activitySchema.index({ resourceType: 1, resourceId: 1 })

export default mongoose.model('Activity', activitySchema)
