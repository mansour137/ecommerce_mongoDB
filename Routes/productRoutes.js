const express = require('express');
const productController = require('../Controller/productController');
const authController = require('../Controller/authController');
const router = express.Router();

router.post('/search' ,productController.searchForProduct)
router.get('/topProductsRated' , productController.topProductsRated);

router
    .route('/:id?')
    .get(productController.getAllProduct)
    .post(
        authController.protect,
        authController.isAdmin,
        productController.uploadProductImages,
        productController.updateNameImages,
        productController.createNewProduct
    )
    .delete(authController.protect, authController.isAdmin, productController.deleteAllProducts);

router
    .route('/:id')
    .patch(
        authController.protect,
        authController.isAdmin,
        productController.uploadProductImages,
        productController.updateNameImages,
        productController.updateProduct
    )
    .delete(authController.protect, authController.isAdmin, productController.deleteProducts);


module.exports = router;
