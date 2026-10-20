const express = require("express");
const router = express.Router()
const authMiddleware=require('../Middleware/auth.middleware');

/**
 *Create a transaction
 */
const transactionController=require('../controllers/transaction.controller');

router.post('/',authMiddleware.authMiddleware ,transactionController.createTransaction);

router.post('/system/initial-funds',authMiddleware.authsysytemUserMiddleware,transactionController.createInitialTransaction); 
 
module.exports = router;

