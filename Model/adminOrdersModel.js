const mongoose = require('mongoose');
const adminOrderSchema = new mongoose.Schema({
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
            }
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
        type: String,
        enum: ['pending' , 'in transit' , 'received'],
        default: "pending"
    },

},{
    timestamps: true,
    versionKey: false,
})


const adminOrders = mongoose.model('adminOrder' , adminOrderSchema );

module.exports = adminOrders;