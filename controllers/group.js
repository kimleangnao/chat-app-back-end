const Group = require("../models/Group")
const {StatusCodes} = require("http-status-codes")
const {UnauthenticatedError, NotFoundError} = require("../errors")

const createGroup = async (req, res) => {
    req.body.createdBy = req.user.userId
    const group = await Group.create({...req.body})

    res.status(StatusCodes.CREATED).json({group})
}

const getAllGroups = async (req, res) => {
    const groups = await Group.find({createdBy:req.user.userId}).sort('createdAt')

    if(!groups){
        throw new UnauthenticatedError('Invalid Credential')
    }

    res.status(StatusCodes.OK).json({groups})
}

const getGroup = async (req, res) => {
    const {user: {userId}, params: {id:groupId} } = req

    const group = await Group.findOne({_id: groupId, createdBy: userId})

    if(!group){
        throw new NotFoundError(`No group with id ${groupId}`)
    }

    res.status(StatusCodes.OK).json({group})
}

const deleteGroup = async (req, res) => {
    const {user: {userId}, params: {id: groupId}} = req

    const group = await Group.findOneAndRemove({createdBy: userId, _id: groupId})

    if(!group){
        throw new NotFoundError(`No group with id ${groupId}`)
    }

   res.status(StatusCodes.OK).json({msg: "success"})

}


module.exports ={
    createGroup,
    getAllGroups,
    getGroup,
    deleteGroup
}