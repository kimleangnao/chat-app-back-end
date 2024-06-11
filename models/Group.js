const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name: {
        type:String,
        default: "Group name " + Math.floor((Math.random()* 100000))
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required: [true, 'Please provide user']
    },
    members: [{
        type:mongoose.Types.ObjectId,
        ref:'User',
    }]
},{timestamps:true})

module.exports = mongoose.model("Group", GroupSchema)

