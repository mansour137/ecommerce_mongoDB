const Users = require('../Model/userModel')
const catchAsync = require('../utilis/catchAsync');
const AppError = require('../utilis/appError');
const multer = require('multer');
const fs = require('fs');
const multerStorage = multer.diskStorage({
    destination:(req , file , cb)=>{
        const destinationDir = 'public/img/users';
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir, { recursive: true });
        }
        cb(null , destinationDir)
        },
    filename:(req , file , cb)=>{
        //user-7885758ddfvdf-5545454.jpeg
        const ext = file.mimetype.split('/')[1]
        cb(null , `user-${req.user.id}-${Date.now()}.${ext}`);
    }
})
const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null , true);
    }else {
        cb(new AppError('not an image please upload only images' , 400), false)
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter: multerFilter
})
exports.uploadUserImage = upload.single('photo')


exports.updateMe = catchAsync(async (req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('not allow to update password here try /updatePassword' , 401));
    }
    let img = ((req.file && req.file.filename) ? req.file.filename:undefined)
    const user = await Users.findOneAndUpdate({ _id: req.user.id },{
        photo:img,
        first_name:req.body.first_name,
        second_name:req.body.second_name
    } , {
        new : true ,
        runValidators:true
        });
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    })
})
exports.allusers = catchAsync(async(req,res,next)=>{
    const users = await Users.find();
    res.status(200).json({
        status:'success',
        data:users
    })
})

exports.user = catchAsync(async(req,res,next)=>{
    const user = await Users.findById(req.params.id);
    if(!user){
        return next(new AppError(`There\'s no user with this ID: ${req.params.id}`));
    }
    res.status(200).json({
        status: 'success',
        user
    })
})


exports.deleteUser = catchAsync(async(req,res,next)=>{
    res.status(404).json({
        message:'use other route to make your action'
    })
})

exports.updateUser = catchAsync(async(req,res,next)=>{
    res.status(404).json({
        message:'use other route to make your action'
    })
})