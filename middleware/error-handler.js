const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
   
    return res.status(err.statusCode).json({ msg: err.message })
  }
  //i need to know if the email is duplicate or not error, so the front-end that show user that
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err})
}

module.exports = errorHandlerMiddleware
