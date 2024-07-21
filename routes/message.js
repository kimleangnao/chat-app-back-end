const express = require('express')
const router = express.Router()

const { addMessage, getMessages } = require('../controllers/message')

router.route('/').post(addMessage)
router.route('/:friendId').get(getMessages)

module.exports = router
