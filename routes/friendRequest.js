const express = require('express')
const router = express.Router()

const { addFriend, acceptFriend } = require('../controllers/auth')

//we need groupId, so we can know which group this link belong to
router.route('/').post(addFriend)
router.route('/accept').post(acceptFriend)

module.exports = router
