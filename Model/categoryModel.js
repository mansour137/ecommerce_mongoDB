const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
        name:{
            type:String,
            required:true,
            unique: true
        },
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true},
        versionKey:false
    })



const categories = mongoose.model('Category' , categorySchema );

module.exports = categories;