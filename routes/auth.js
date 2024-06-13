const express = require('express');
const router = express.Router();

const {login, register, getSearchUsers} = require('../controllers/auth')

router.get("/", getSearchUsers)
router.post("/register", register);
router.post("/login", login)



module.exports = router;