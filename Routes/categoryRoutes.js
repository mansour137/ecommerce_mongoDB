const express  = require('express');
const categoryController = require('../Controller/categoryController');
const productController = require('../Controller/productController');
const router = express.Router();

/////////////////////category///////////////////

router
    .route('/:id/products')
    .get(productController.getProductsForSpecificCategory)

router
    .route('/:id?')
    .get(categoryController.getCategory)
router
    .route('/')
    .post(categoryController.createCategory)
router
    .route('/:id')
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory)

module.exports = router;