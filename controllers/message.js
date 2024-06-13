const Message = require('../models/Message')
const {StatusCodes} = require("http-status-codes")
const {BadRequestError, UnauthenticatedError} = require("../errors")

const addMessage = async (req, res) => {
    req.body.createdBy = req.user.userId

    const message = await Message.create({...req.body})


    res.status(StatusCodes.CREATED).json({msg: 'success', message})
}

const getMessages = async (req, res) => {

    const {groupId} = req.body

    const messages = await Message.find({groupId}).sort('createdAt')

    res.status(StatusCodes.OK).json({msg: 'success', messages})
}

module.exports = {
    addMessage,
    getMessages
}

