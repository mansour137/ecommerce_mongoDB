const mongoose = require('mongoose');
const myOrderSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products: [
        {
            productDetail: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
                quantity: Number,
            },
            quantity:{
                type:Number,
                required: true,
            },
        }
    ],
    paymentStatus:{
        type:String,
        required: true
    },
    payment_intent_ID:{
        type:String,
        required: true
    },
    delivery_status: {
        type: String, default: "pending"
    }

},{
    timestamps: true,
    versionKey: false,
})

// myOrderSchema.pre(/^(find|save)/, async function (next) {
//     await this.populate({
//         path: 'products.productDetail',
//     });
//     next();
// });

const myOrders = mongoose.model('myOrder' , myOrderSchema );

module.exports = myOrders;