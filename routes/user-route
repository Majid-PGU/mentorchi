const express = require('express')
const router = express.Router()
const userController = require("../controllers/user-controller")
const bcrypt = require ("bcrypt")

router.get('/:pass', async (req,res,next)=> {
    res.send(await bcrypt.hash(req.params.pass , 10));
})
router.post("/register" , userController.register)
router.post("/login" , userController.login)


module.exports = router