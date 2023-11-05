const mongoose = require('mongoose');
const checkoutSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type:Number,
            required:true
        }
    }],
    shippingAddress: {
        type: String,
        required: true
    },
    paymentStatus:{
        type:String,
        required: true
    },

},{
    versionKey: false,
})



const checkout = mongoose.model('checkout' ,checkoutSchema );

module.exports = checkout;