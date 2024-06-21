const express = require('express')
const router = express.Router()

const { login, register, verifyLoginToken } = require('../controllers/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/verifyToken', verifyLoginToken)

module.exports = router
