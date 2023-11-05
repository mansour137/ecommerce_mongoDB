const catchAsync = require('../utilis/catchAsync');
const AppError = require('../utilis/appError');
const ApiFeatures = require('../utilis/apiFeatures');

exports.getAllOrOne = (model) => catchAsync(async (req, res, next) => {
    let filter = {};
    let ch = false;
    if (req.params.id) {
        ch = true;
        filter = { _id: req.params.id }
    }

    const doc = new ApiFeatures(model.find(filter), req.query)
        .sort()
        .paginate()
        .filter();
    const result = await doc.query;
    let relatedProducts = [];
    if (ch && model.modelName === 'Product') {

        relatedProducts = await model.find({ category:result[0].category });
        res.status(201).json({
            status: 'success',
            documents: result.length,
            data: {
                result,
                related_Products: relatedProducts,
            }
        });
    } else {
        res.status(201).json({
            status: 'success',
            documents: result.length,
            data: {
                result,
            }
        });
    }
})

exports.creatNewOne= (model) => catchAsync(async (req,res,next)=>{
    const doc = await model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    });
})
exports.update = (model) => catchAsync(async (req,res,next)=>{
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'Updated successfully',
        data: {
            doc
        }
    });
})
exports.delete = (model) => catchAsync(async (req,res,next)=>{
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
})

exports.deleteAll = () => catchAsync(async (req,res,next)=>{
    res.status(204).json({
        status: 'success, deleted cart',
        data: null
    });
})