const adminOrder = require('../Model/adminOrdersModel');
const myOrder = require('../Model/my0rderModel')
const catchAsync = require("../utilis/catchAsync");
const AppError = require("../utilis/appError");

exports.getAllMyOrders = catchAsync(async (req,res,next)=>{
    let filter={};
    if(req.params.id) filter = {_id:req.params.id}
    const result = await adminOrder.find(filter).populate({
        path: 'products.productDetail',
    });
    res.status(200).json(result)
})
exports.updateStatusOrder = catchAsync(async (req,res,next)=>{
    const doc = await adminOrder.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    await myOrder.findOneAndUpdate({payment_intent_ID:doc.payment_intent_ID}, req.body, {
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