const express = require('express')
const router = express.Router()

const { getSearchUsers } = require('../controllers/auth')

router.get('/:searchTerm', getSearchUsers)

module.exports = router
