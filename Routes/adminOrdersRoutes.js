const express  = require('express');
const adminOrderController = require('../Controller/adminOrdersController');
const authController = require('../Controller/authController');
const router = express.Router();

/////////////////////ADMIN_ORDERS///////////////////////

router.route('/:id?')
    .get( authController.protect, authController.isAdmin , adminOrderController.getAllMyOrders)
router.route('/:id')
    .patch(authController.protect, authController.isAdmin , adminOrderController.updateStatusOrder)
module.exports = router;