const InviteLink = require("../models/InviteLink")
const {StatusCodes} = require("http-status-codes")
const {NotFoundError} = require("../errors")

const createInvite = async (req, res) => {
    req.body.createdBy = req.user.userId
    //right now, everytime we click on invite or make a call to create invite
    //it will generate a new invite Id
    //without checking the current if it existed yet
    //and return back the newly created invite ID

    const invite = await InviteLink.create({...req.body})

    res.status(StatusCodes.OK).json({msg: 'success', id: invite._id})
}
const joinRequest = async (req, res) => {
    //i need to received the id of the invite and compare it inside the database
    //if it existed, then we return a link to the group ID back to the front end
    //the front end, then will push the page to the chat dialogue page
    //and we need to give this user permission now to see this group chat on their home page
    res.send('joinRequest')
}

module.exports = {
    createInvite,
    joinRequest
}