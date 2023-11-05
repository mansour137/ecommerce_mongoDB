const express  = require('express');
const checkoutController = require('../Controller/checkoutController');
const authController = require('../Controller/authController');
const router = express.Router();

/////////////////////Checkout///////////////////////

router.get( '/checkout-session/:cartId', authController.protect ,checkoutController.checkoutSessionTrialVersion )
router.post('/webhook', express.raw({type: 'application/json'}),checkoutController.handleStripeWebhook)




module.exports = router;