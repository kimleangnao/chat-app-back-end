const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')
const jwt = require('jsonwebtoken')

const { StatusCodes } = require('http-status-codes')
const {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} = require('../errors')

const register = async (req, res) => {
    const user = await User.create({ ...req.body })
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({
        user: {
            userId: user._id,
            name: user.name,
            title: user.title,
            friends: user.friends,
            friendRequests: user.friendRequests,
        },
        token,
    })
}

const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({ email })
        .populate({
            path: 'friendRequests',
            populate: {
                path: 'requester recipient',
                select: '_id name title',
            },
        })
        .populate('friends', '_id name title')

    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = await user.createJWT()
    res.status(StatusCodes.OK).json({
        user: {
            userId: user._id,
            name: user.name,
            title: user.title,
            friends: user.friends,
            friendRequests: user.friendRequests,
        },
        token,
    })
}

const verifyLoginToken = async (req, res) => {
    const { token } = req.body
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { userId: payload.userId, name: payload.name }
        const { userId } = req.user.userId
        const user = await User.findOne(
            { id: userId },
            { name: 1, title: 1, _id: 1 }
        )
            .populate({
                path: 'friendRequests',
                populate: {
                    path: 'requester recipient',
                    select: '_id name title',
                },
            })
            .populate('friends', '_id name title')

        return res.status(StatusCodes.OK).json({ msg: 'success', user })
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid')
    }
}

const addFriend = async (req, res) => {
    const { userId } = req.user
    const { recipientId } = req.body
    //console.log('userId:', userId, recipientId)
    if (userId == recipientId) {
        //console.log('yourself!')
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: 'You cannot add yourself' })
    }
    //console.log('1')
    const existingRequest = await FriendRequest.findOne({
        requester: userId,
        recipient: recipientId,
    })
    //console.log('2')
    const existingRequestFromThem = await FriendRequest.findOne({
        requester: recipientId,
        recipient: userId,
    })
    if (existingRequest || existingRequestFromThem) {
        //console.log('existing!')
        return res.status(StatusCodes.OK).json({ msg: 'Friend already sent' })
    }
    //console.log('3')
    const friendRequest = await FriendRequest.create({
        requester: userId,
        recipient: recipientId,
    })
    //console.log('4')
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $push: { friendRequests: friendRequest._id },
        },
        { new: true }
    )
    //console.log('5')
    await User.findByIdAndUpdate(recipientId, {
        $push: { friendRequests: friendRequest._id },
    })
    //console.log('end!')
    res.status(StatusCodes.OK).json({ msg: 'sent', updatedUser })
}

const acceptFriend = async (req, res) => {
    const { id: friendRequestId } = req.params
    const friendRequest = await FriendRequest.findOne({ _id: friendRequestId })

    if (!friendRequest) {
        throw new NotFoundError('could not find and update the request')
    }
    if (friendRequest.requester == req.user.userId) {
        throw new BadRequestError('You cannot accept your own friend request.')
    }
    if (friendRequest.recipient != req.user.userId) {
        throw new BadRequestError(
            'You have to be the user that received request to accept it'
        )
    }

    //remove friend request from requester
    await User.updateOne(
        { _id: friendRequest.requester },
        { $pull: { friendRequests: friendRequestId } }
    )

    //remove friend request from recipient
    await User.updateOne(
        { _id: friendRequest.recipient },
        { $pull: { friendRequests: friendRequestId } }
    )

    //add friendId to the requester friends list
    await User.updateOne(
        { _id: friendRequest.requester },
        { $addToSet: { friends: friendRequest.recipient } }
    )

    //add friendId to the recipient friends list
    await User.updateOne(
        { _id: friendRequest.recipient },
        { $addToSet: { friends: friendRequest.requester } }
    )

    //final update to the FriendRequest document
    const updateFriendRequest = await FriendRequest.findByIdAndUpdate(
        { _id: friendRequestId },
        { status: 'Accepted' },
        { new: true }
    )

    //return back new user information,
    //populate the friendRequest and friends
    const user = await User.findOne({ _id: req.user.userId })
        .populate({
            path: 'friendRequests',
            populate: {
                path: 'requester recipient',
                select: '_id name title',
            },
        })
        .populate('friends', '_id name title')

    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    res.status(StatusCodes.OK).json({ msg: 'success', user })
}

const getSearchUsers = async (req, res) => {
    const {
        params: { searchTerm: search },
        user: { userId },
    } = req

    if (!search || typeof search != 'string') {
        throw new BadRequestError('Please provide a valid search')
    }
    //console.log(search, userId)
    const searchQuery = {
        name: { $regex: new RegExp(search, 'i') },
        _id: { $ne: userId },
    }
    const projection = {
        name: 1,
        title: 1,
        _id: 1,
        friendRequests: 1,
    } // Include desired fields

    const users = await User.find(searchQuery, projection)

    if (!users.length > 0) {
        throw new NotFoundError('Not found')
    }

    const currentUser = await User.findById(userId)

    const friendIds = currentUser.friends.map((id) => id.toString())

    const filteredUsers = users.filter(
        (filterUser) => !friendIds.includes(filterUser._id.toString())
    )

    const modifiedUsers = filteredUsers.map((user) => user.toObject())

    modifiedUsers.forEach((user) => {
        user.requested = false
        //make sure user has friendRequest is not null

        if (currentUser.friendRequests != null) {
            friendRequestsSet = new Set(
                currentUser?.friendRequests?.map((request) =>
                    request.toString()
                ) || []
            )
        }

        user.requested = user.friendRequests.some((request) =>
            friendRequestsSet.has(request.toString())
        )
    })

    res.status(StatusCodes.OK).json(modifiedUsers)
}

module.exports = {
    register,
    login,
    getSearchUsers,
    addFriend,
    acceptFriend,
    verifyLoginToken,
}
