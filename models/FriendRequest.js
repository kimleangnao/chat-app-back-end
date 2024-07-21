const mongoose = require('mongoose')

const FriendRequestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user Id'],
        },
        recipient: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please recipient user Id'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending',
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('FriendRequest', FriendRequestSchema)
