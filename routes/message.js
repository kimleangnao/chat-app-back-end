const express = require('express')
const router = express.Router();

const {addMessage, getMessages} = require('../controllers/message')

router.post('/', addMessage)
router.get('/', getMessages)

module.exports = router;