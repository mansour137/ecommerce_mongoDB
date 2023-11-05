const Review = require('../Model/reviewModel')
const factory = require('./factoryHandler');

exports.getReview = factory.getAllOrOne(Review);
exports.createReview = factory.creatNewOne(Review);
exports.updateReview = factory.update(Review);
exports.deleteReview = factory.delete(Review);

