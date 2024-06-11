

const express = require('express')
const router = express.Router();


const {  
    createGroup,
    getAllGroups,
    getGroup,
    deleteGroup
} = require("../controllers/group")

router.route("/").post(createGroup).get(getAllGroups)
router.route("/:id").delete(deleteGroup).get(getGroup)

module.exports = router;