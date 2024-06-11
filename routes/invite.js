
const express = require('express')
const router = express.Router();

const {createInvite, joinRequest} = require('../controllers/invite')

//we need groupId, so we can know which group this link belong to
router.route("/").get(createInvite).post(joinRequest)

module.exports = router;