const mongoose = require('mongoose');
const Product = mongoose.model('Product');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{
    versionKey: false,
});

reviewSchema.post('save', async function (doc) {
    await Product.findByIdAndUpdate(doc.product, { $push: { reviews: doc._id } });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
