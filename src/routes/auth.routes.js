const express = require('express');
const authcontroller = require('../controllers/auth.controller');
const router = express.Router()

router.post("/register",authcontroller.userRegister);
router.post("/login",authcontroller.userlogin);
router.post("/logout",authcontroller.userLogout);


module.exports = router;