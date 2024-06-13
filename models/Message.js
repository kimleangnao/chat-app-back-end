const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    message: {
        type:String,
        required: [true, "Please provide message"]
    },
    groupId: {
        type:mongoose.Types.ObjectId,
        ref: 'Group',
        required: [true, "Please provide group id"]
    },
    createdBy: {
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, "Please provide user"]
    }

}, {timestamps: true})

module.exports = mongoose.model('Message', MessageSchema);