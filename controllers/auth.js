const User= require("../models/User")
const {StatusCodes} = require("http-status-codes")
const {BadRequestError, UnauthenticatedError} = require("../errors")

const register = async (req, res) => {
    const user = await User.create({...req.body})
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({user: {name: user.accountname}, token})
}

const login = async (req, res) => {

    const {email, password} = req.body;

    if(!email || !password){
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({email});

    if(!user){
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = await user.createJWT();
    res.status(StatusCodes.OK).json({user: {name: user.name}, token})
}

const getSearchUsers = async (req, res) => {
    const {search} = req.body
    res.json( {msg: "Search for user!", search})
}

module.exports = {
    register,
    login,
    getSearchUsers
}