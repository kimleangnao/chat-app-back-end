//this will run before all protected routes
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization
    //console.log('bearer!')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Header Invalid')
    }
    //console.log('authHeader.split', authHeader.split(' '))
    const token = authHeader.split(' ')[1]
    //console.log()
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //console.log(payload)
        req.user = { userId: payload.userId, name: payload.name }
        next()
    } catch (error) {
        //console.log('ERROR!')
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = auth
