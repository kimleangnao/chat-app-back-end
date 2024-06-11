const mongoose = require('mongoose')

const InviteSchema = new mongoose.Schema({
    groupId: {
        type:mongoose.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Please provide a group Id']
    },
    createdBy: {
        type:mongoose.Types.ObjectId,
        ref:'User',
        required: [true, 'Please provide user']
    }
}, {timestamps: true})

module.exports = mongoose.model("Invite", InviteSchema)
