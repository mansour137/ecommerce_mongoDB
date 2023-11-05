const catchAsync = require("../utilis/catchAsync");
const Users = require("../Model/userModel");
const AppError = require("../utilis/appError");
const sendEmail = require("../utilis/email");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const {promisify} = require('util')


const generateToken = (id) =>{
    return jwt.sign({id : id} , process.env.SECRET_JWT,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const sendToken = (user , statusCode , res )=>{

    const token = generateToken(user._id);
    const data = parseInt(process.env.JWT_EXPIRES_IN , 10)
    const expirationDate = new Date(Date.now() + data * 24 * 60 * 60 * 1000);
    delete user.__v;
    user.active = undefined;
    user.password = undefined;
    res
        .cookie('jwt', token, {
            expires: expirationDate,
            httpOnly: true,
        })
        .status(statusCode)
        .json({
            status: 'success',
            token,
            data: {
                user,
            },
        });
}

exports.isAdmin = catchAsync(async (req,res,next)=>{
    console.log(req.user)
    if (req.user.role !== 'admin') {
        return next(new AppError(`You don't have permission to perform this action`, 403));
    }
    next();
})

exports.protect = catchAsync(async (req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    console.log('Token:', token);
    console.log('URL:', req.originalUrl);

    if (!token && req.originalUrl.startsWith('/api/v1/cart')) {
        req.user = undefined;
        return next();
    }

    if(!token) {
        return next(new AppError('you are not logged please log in to access', 401))
    }
    req.token = token;
    const decoded = await promisify(jwt.verify)(token , process.env.SECRET_JWT);

    const userExist = await Users.findById(decoded.id).select('+active +role');
    if(!userExist){
        return next(new AppError('the token not longer exist' , 401));
    }
    if(!userExist.active){
        return next(new AppError('this user no longer exist' , 401));
    }

    if(userExist.changedPasswordAfter(decoded.iat)){
        return next(new AppError('the token not longer exist login again pls' , 401));
    }
    req.user = userExist;
    next()
})

exports.USER = catchAsync(async (req,res,next)=>{
    console.log(req.user);
})

exports.chLogin = (req, res, next) => {
    console.log(req.cookies.jwt)
    if(req.cookies.jwt){
        return res.status(302).json({
            message: 'You are already logged in.',
            token: req.cookies.jwt
        });
    }
    next();
}

exports.logout = catchAsync(async (req, res, next) => {
    // console.log(req.user)
    if (!req.cookies.jwt) {
        return next(new AppError('You are not logged in.', 401));
    }
    res.clearCookie('jwt')
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    });
    //     res.cookie('jwt', 'loggedOut', {
    //         expires: new Date(Date.now() + 1 * 1000),
    //         httpOnly: true,
    //     })
    //     res.status(200).json({
    //         message:"logged out"
    //     })

});

exports.signUp = catchAsync(async (req,res,next)=>{
    // const {first_name, second_name, mobile, gender , email , password , passwordConfirm} = req.body;
    const userExist = await Users.findOne({email:req.body.email});
    if(userExist){
        return res.status(302).json({
            msg:'email exist before',
            userExist
        })
    }
    const newUser = await Users.create(req.body);
    sendToken(newUser , 200 , res )
})

exports.login = catchAsync(async (req,res,next)=>{

    const {email , password} = req.body;
    const user = await Users.findOne({email : email}).select('+password');
    if(!user || !await user.comparePassword(password , user.password)) {
        return next(new AppError('invalid email or password' , 401  ))
    }
    req.session.userId = user._id;
    req.chUser = user;
    sendToken(user , 200 , res )
})

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('Invalid email', 404));
    }
    const resetToken = user.resetPassword();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
    const message = `PLEASE, change your password in just 10 min only use this URL => ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message,
        });

        // Respond to the client with a success message
        res.status(200).json({
            status: 'success',
            message: 'Password reset email sent successfully.',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.log(err);
        res.status(500).json({
            status: 'error',
            error: err.message || 'An error occurred while sending the email.',
        });
    }
});
exports.resetPassword = catchAsync(async (req,res,next)=>{
    const hashedToken = crypto.createHash('sha256').update( req.params.token).digest('hex')
    const user = await Users.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires : {
            $gt: Date.now()
        }
    })
    if(!user){
        return next(new AppError('invalid url, please try again' , 401))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({
        status:'Success Updated Password'
    })
})
exports.deleteMe = catchAsync(async (req,res,next)=>{
    const user = await Users.findById(req.user.id);
    console.log(user);
    if(!user)
        return next(new AppError('please login' , 401));

    user.active = false;
    user.save();
    res.clearCookie('jwt');
    res.status(200).json({
        status:'User are deleted successfully'
    })
})

exports.updatePassword = catchAsync(async (req,res,next)=>{
    const user = await Users.findById(req.user.id).select('+password');
    if(!user)
        return next(new AppError('please login' , 401));

    const {currentPassword , newPassword , passwordConfirm} = req.body;

    if (!await user.comparePassword(currentPassword, user.password)) {
        return next(new AppError('Invalid password', 401));
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    user.save();
    res.clearCookie('jwt');
    res.status(200).json({
        message:"login again",
        status:'Password updated successfully'
    })
})
