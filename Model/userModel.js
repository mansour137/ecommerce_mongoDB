const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true,
        validate: [validator.isEmail, 'Provide a valid email']
    },
    first_name:{
        type:String,
        required: [true , 'enter your First name']
    },
    second_name:{
        type:String,
        required: [true , 'enter your Second name']
    },
    mobile:{
        type:String,
        unique:true,
        required: [true , 'enter your Mobile']
    },
    gender:{
        type:String,
        required: [true , 'enter your gender'],
        enum: ['male', 'female']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    password:{
        type:String,
        select:false,
        require:[true , 'please enter password'],
        min:[8 , 'minimum 8 character'],
    },
    passwordConfirm:{
        type:String,
        select:false,
        require:[true , 'please enter passwordConfirm'],
        validate:{
            validator:function(p){
                return p === this.password ;
            },
            message:'passwords are not the same'
        }
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    passwordChangedAt:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    role: {
        type:String,
        default: 'user',
        select:false
    },
    address: {
        type: String,
    },
    country:String,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

},{
    versionKey: false,
})

//save hashing password middleware
userSchema.pre('save' ,async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password , 12);
    this.passwordConfirm = undefined;
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/ , function (next){
    this.find({active : {$ne : false}}).select('-__v');
    next();
})


userSchema.methods.changedPasswordAfter = function (timeStamp){
    if(this.passwordChangedAt){
        const timestampInSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000 , 10);
        return timeStamp < timestampInSeconds;
    }
    return false;
}

//method to compare password during login

userSchema.methods.comparePassword = async function (candidatePass , userPass){
    return await bcrypt.compare(candidatePass , userPass)
}

//reset password
userSchema.methods.resetPassword = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 2 * 60 * 1000;
    return resetToken;
}




const Users = mongoose.model('User' ,userSchema );

module.exports = Users;