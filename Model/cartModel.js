const mongoose = require('mongoose');

const cartSchema =new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        products: [
                {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                    quantity: Number,
                },
                quantity:{
                    type:Number,
                    required: true,
                }
            }
        ]
    },{
    versionKey: false,
})

cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products.productId',
        select: 'name price',
    });
    next();
});


const Cart = mongoose.model('Cart' ,cartSchema );

module.exports = Cart;