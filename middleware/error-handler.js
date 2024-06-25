const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
    // if (err instanceof CustomAPIError) {

    //   return res.status(err.statusCode).json({ msg: err.message })
    // }
    const customError = {
        statusCodes: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, try again later',
    }

    if (err.name == 'ValidationError') {
        customError.msg = Object.values(err.errors).map((item) => item.message)
        customError.statusCodes = 400
    }

    if (err.code && err.code == 11000) {
        customError.msg = `Duplicate value enter for ${Object.keys(err.keyValue)} field, please choose another value`
        customError.statusCodes = 400
    }

    if (err.name == 'CastError') {
        customError.msg = `No item found with id: ${err.value}`
        customError.statusCodes = 404
    }

    //i need to know if the email is duplicate or not error, so the front-end that show user that
    return res.status(StatusCodes.statusCodes).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware
