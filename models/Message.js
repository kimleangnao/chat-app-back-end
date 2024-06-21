const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide receiver id'],
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user'],
        },
        messageText: {
            type: String,
            required: [true, 'Please provide message'],
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Message', MessageSchema)
