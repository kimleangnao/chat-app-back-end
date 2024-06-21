const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

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
    //this will be handle after the search, add, accept friend are done

    //when user need to refresh, we will use this to verify their token
    // to make sure , their information are stayed updated
    //and their login experience is seamless

    res.send('Verified')
}

const addFriend = async (req, res) => {
    //when user add,
    //we the dev need to send a request to the FriendRequest
    //add it to friendRequests in user schema for both user
    //the adder and the receipient
    //reason: so when user log in, they can see it in their
    //friendRequest instead of having to query to from another
    //source to get their friend request
    //FriendRequest is a good place to store all information
    //related to friendRequesting
    const { userId } = req.user
    const { recipientId } = req.body
    //console.log(userId, recipientId)
    //check to make sure user is not receipient id
    if (userId == recipientId) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: 'You cannot add yourself' })
    }

    const existingRequest = await FriendRequest.findOne({
        requester: userId,
        recipient: recipientId,
    })
    if (existingRequest) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: 'Friend already sent' })
    }

    //create a Friendrequest
    const friendRequest = await FriendRequest.create({
        requester: userId,
        recipient: recipientId,
    })

    //update user and receipient friendRequests
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $push: { friendRequests: friendRequest._id },
        },
        { new: true }
    )

    await User.findByIdAndUpdate(recipientId, {
        $push: { friendRequests: friendRequest._id },
    })

    //we should send user information back, the current user, so user can get
    //the most up to date user information

    res.status(StatusCodes.OK).json({ msg: 'sent', updatedUser })
}
const acceptFriend = async (req, res) => {
    //if user accept friendRequest,
    //1: status will change in friendRequest schema
    // from pending to accept,
    //if rejected, it will change to so
    //once accept: user and receipient will
    //add each other to their friends list
    //if reject, status will change to reject and the request will get delete
    const { friendRequestId } = req.body
    const friendRequest = await FriendRequest.findOne({ _id: friendRequestId })
    //('friendRequest:', friendRequest)
    if (!friendRequest) {
        throw new NotFoundError('could not find and upate the request')
    }
    if (friendRequest.requester == req.user.userId) {
        throw new BadRequestError('You cannot accept your own friend request.')
    }
    if (friendRequest.recipient != req.user.userId) {
        throw new BadRequestError(
            'You have to be the user that received request to accept it'
        )
    }

    //update the requester and recipient friends
    //delete friend request from friendRequests from both requester and recipient
    //console.log(friendRequest)
    //console.log(friendRequest.requester, friendRequest.recipient)

    await User.updateOne(
        { _id: friendRequest.requester },
        { $pull: { friendRequests: friendRequestId } }
    )
    await User.updateOne(
        { _id: friendRequest.recipient },
        { $pull: { friendRequests: friendRequestId } }
    )

    //now give them both each other friend
    //save each other Id to friends
    await User.updateOne(
        { _id: friendRequest.requester },
        { $addToSet: { friends: friendRequest.recipient } }
    )
    await User.updateOne(
        { _id: friendRequest.recipient },
        { $addToSet: { friends: friendRequest.requester } }
    )
    //console.log('fine')
    //update to the FriendRequest
    const updateFriendRequest = await FriendRequest.findByIdAndUpdate(
        { _id: friendRequestId },
        { status: 'Accepted' },
        { new: true }
    )
    //console.log(updateFriendRequest)

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
    const searchQuery = {
        name: { $regex: new RegExp(search, 'i') },
        _id: { $ne: userId },
    }
    const projection = {
        name: 1,
        title: 1,
        _id: 1,
    } // Include desired fields

    //query for all user that match the search
    const users = await User.find(searchQuery, projection)

    if (!users.length > 0) {
        throw new NotFoundError('Not found')
    }

    //now i need to query current User to make sure, they are not friend
    const currentUser = await User.findById(userId)

    //get friendRequests Id
    const friendRequestIds = currentUser.friendRequests.map((id) =>
        id.toString()
    )

    //get friends Id
    const friendIds = currentUser.friends.map((id) => id.toString())
    //filter out the user that matched friend
    const filteredUsers = users.filter(
        (filterUser) => !friendIds.includes(filterUser._id.toString())
    )
    //console.log(friendRequestIds)
    //make sure requested change to true or false base on,
    //if user already sent request or not

    const modifiedUsers = filteredUsers.map((user) => user.toObject())

    modifiedUsers.forEach((user) => {
        if (friendRequestIds.includes(user._id.toString())) {
            user.requested = true
        } else {
            user.requested = false
        }
    })
    //console.log(filteredUsers)

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
