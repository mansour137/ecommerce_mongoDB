const Product = require('../Model/productModel')
const factory = require('./factoryHandler');
const multer = require("multer");
const catchAsync = require('../utilis/catchAsync');
const fs = require("fs");
const AppError = require("../utilis/appError");
exports.getAllProduct = factory.getAllOrOne(Product);
exports.createNewProduct = factory.creatNewOne(Product);
exports.deleteAllProducts = factory.delete(Product);
exports.updateProduct = factory.update(Product);
exports.deleteProducts = factory.delete(Product);

exports.getProductsForSpecificCategory = catchAsync(async (req,res , next)=>{
    const docs =await Product.find({category:req.params.id}).populate('category')
    res.status(200).json({data:docs.length , docs});
})

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationDir = 'public/img/products';
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir, { recursive: true });
        }
        cb(null, destinationDir);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image. Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadProductImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 10 }
])

exports.updateNameImages = catchAsync(async (req, res, next) => {
    console.log(req.files , req.body);
    // 1 - Image Cover for product
    if (!req.files.imageCover)
        return next();
    req.body.imageCover = `product${(req.params.id?'-'+req.params.id:'')}-${Date.now()}-cover.jpeg`;
    fs.renameSync(req.files.imageCover[0].path, `public/img/products/${req.body.imageCover}`);

    // 2 - Images of products
    if(!req.files.images ) return next()
    req.body.images = [];
    req.files.images.forEach((file, i) => {
        const fileName = `product${(req.params.id?'-'+req.params.id:'')}-${Date.now()}-${i + 1}.jpeg`;
        fs.renameSync(file.path, `public/img/products/${fileName}`);
        req.body.images.push(fileName);
    });

    next();
});



exports.topProductsRated = catchAsync(async (req, res, next) => {
        const topRatedProducts = await Product.aggregate([
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'reviews',
                    foreignField: '_id',
                    as: 'productReviews',
                },
            },
            {
                $addFields: {
                    averageRating: { $avg: '$productReviews.rating' },
                },
            },
            {
                $match: { averageRating: { $gte: 3.5 } },
            },
            {
                $sort: { averageRating: -1 },
            },
        ]);

        console.log('top Rated Products:',topRatedProducts);

        res.json({ topRatedProducts });

});

exports.searchForProduct = catchAsync(async (req,res,next)=>{
    const products = await Product.searchFor(req.query.search);
    if(products.length === 0)
        res.status(404).json({message:'not found'})

    res.status(200).json({data :products.length , products})

})