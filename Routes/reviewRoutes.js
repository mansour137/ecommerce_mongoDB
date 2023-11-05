const express  = require('express');
const reviewController = require('../Controller/reviewController');
const authController = require('../Controller/authController');
const router = express.Router();

router
    .route('/:id?')
    .get(authController.protect , reviewController.getReview)
    .post(authController.protect , reviewController.createReview)
router
    .route('/:id')
    .delete(authController.protect , reviewController.deleteReview)
    .patch(authController.protect , reviewController.updateReview)

module.exports = router;