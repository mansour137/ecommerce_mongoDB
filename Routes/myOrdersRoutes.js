const express  = require('express');
const myOrderController = require('../Controller/myOrderController');
const authController = require('../Controller/authController');
const router = express.Router();

/////////////////////MY_ORDERS///////////////////////

router.get('/:id?', authController.protect, myOrderController.getAllMyOrders);
module.exports = router;