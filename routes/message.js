const express = require('express')
const router = express.Router()

const { addMessage, getMessages } = require('../controllers/message')

router.route('/').post(addMessage)
router.route('/get').post(getMessages)

module.exports = router
