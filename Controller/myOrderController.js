const myOrder = require('../Model/my0rderModel');
const factory = require('./factoryHandler');
const catchAsync = require('../utilis/catchAsync');
const ApiFeatures = require("../utilis/apiFeatures");


exports.getAllMyOrders = catchAsync(async (req,res,next)=>{
    let filter={};
    if(req.params.id) filter = {_id:req.params.id}

    const doc = new ApiFeatures(myOrder.find(filter).populate({
        path: 'products.productDetail',
    }), req.query)
        .sort()
        .paginate()
        .filter();
    const result = await doc.query;
    // const result = await myOrder.find(filter).populate({
    //     path: 'products.productDetail',
    // });
    res.status(200).json(result)
})