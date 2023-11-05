const slugify = require('slugify');
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true,
    },
    slug : String,
    quantity:{
        type: Number,
        required: true,
        min:0
    },
    color: [],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    brand:{
        type:String,
        required:true,
    },
    price: {
        type: Number,
        required: true,
    },
    description:{
        type:String,
        required:[true,'A product must have a description']
    },

    //need some detail
    // country:[
    //     {
    //         type:String,
    //         required:true
    //     }
    // ],
    imageCover:{
        type:String,
        required:[true,'A product must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
},
    {
        versionKey: false,

    })

productSchema.pre('save',function (next){
    this.slug = slugify(this.name, {lower:true});
    next();
})

productSchema.statics.searchFor = async function (keyword){
    return await this.find({
        $or:[
            {
                name :{$regex:keyword , $options:'i'}
            },
            {
                description :{$regex:keyword , $options:'i'}
            }
        ]
    })
}

const Products = mongoose.model('Product' ,productSchema );

module.exports = Products;