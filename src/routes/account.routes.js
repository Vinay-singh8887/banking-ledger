const express = require("express");
const authMiddleware = require('../Middleware/auth.middleware')
const AccountController = require('../controllers/account.controller')


const router = express.Router()

router.post("/",authMiddleware.authMiddleware,AccountController.createAccountController)

router.get("/",authMiddleware.authMiddleware,AccountController.getAllAccountsController)

router.get("/balance/:accountId",authMiddleware.authMiddleware,AccountController.getAccountBalanceController)
module.exports = router