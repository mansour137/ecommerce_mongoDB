const express  = require('express');
const cartController = require('../Controller/cartController');
const authController = require('../Controller/authController');
const router = express.Router();

/////////////////////CART///////////////////

////need to make new update from authController.product for cart
////now it's working that he must be logged in *****************

router
    .route('/add-to-cart')
    .post( cartController.addToCartAsGuest)
router
    .route('/')
    .get(authController.protect ,cartController.getAllCart)
router
    .route('/delete-product-from-cart/:id')
    .delete(authController.protect , cartController.deleteProductFromCartTrialVersion)
router
    .route('/delete-allCart/:id?')
    .delete(cartController.deleteCartTrialVersion);


module.exports = router;