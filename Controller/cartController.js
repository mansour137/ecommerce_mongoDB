const Cart = require('../Model/cartModel')
const Product = require('../Model/productModel')
const AppError = require("../utilis/appError");
// const {v4: uuidv4} = require('uuid');
const catchAsync = require('../utilis/catchAsync')
const checkQuantity = async (id,Product, quantity) => {
    const product = await Product.findById(id);
    return product && product.quantity >= quantity;
};
// exports.getAllCart = catchAsync(async (req, res, next) => {
//     console.log('err come from here');
//     console.log(req.user);
//
//
//     if (req.user) {
//         // Get the cookie cart
//         let cookieCart = [];
//         if (req.cookies.cart) {
//             cookieCart = req.cookies.cart;
//         }
//
//         // Get the database cart
//         const dbCart = await Cart.findOne({userId: req.user.id});
//
//         // If there is a database cart, iterate over it and add each item to the cookie cart if it is not already there
//         if (dbCart) {
//             for (let item of dbCart) {
//                 const productExistsInCookieCart = cookieCart.find(el => el.productId === item.productId);
//                 if (!productExistsInCookieCart) {
//                     cookieCart.push({
//                         productId: item.productId,
//                         quantity: 1,
//                     });
//                 }
//             }
//         } else {
//             await Cart.create({
//                 userId: req.user.id,
//                 products: cookieCart.map((cookieProduct) => ({
//                     productId: cookieProduct.productId,
//                     quantity: cookieProduct.quantity,
//                 })),
//             });
//         }
//
//         const result = await Cart.find({ userId: req.user.id }).populate({
//             path: 'products.productId',
//             select: 'name , price',
//         });
//
//         res.status(201).json({
//             status: 'success',
//             documents: result.length,
//             aaaaaaaaaaaaaaaaaaa: {
//                 result,
//             },
//         });
//     } else {
//         res.status(200).json({ cart: req.cookies.cart });
//     }
// });



const mongoose = require('mongoose');

exports.getAllCart = catchAsync(async (req, res, next) => {
    console.log('err come from here');
    console.log(req.user);

    if (req.user) {
        let cookieCart = [];
        if (req.cookies.cart) {
            cookieCart = req.cookies.cart;
        }
        const dbCart = await Cart.findOne({ userId: req.user.id });
        if (dbCart) {
            // console.log(dbCart);
            // console.log(cookieProduct);

            for (const cookieProduct of cookieCart) {
                const matchingProduct = dbCart.products.find((product) => {
                    return product.productId._id.toString() === cookieProduct.productId;
                });

                if (matchingProduct) {
                    if (matchingProduct.quantity !== cookieProduct.quantity) {
                        matchingProduct.quantity = cookieProduct.quantity;
                    }
                } else {
                    dbCart.products.push({
                        productId: cookieProduct.productId,
                        quantity: cookieProduct.quantity,
                    });
                }
            }


            await dbCart.save();
        } else {
            await Cart.create({
                userId: req.user.id,
                products: cookieCart.map((cookieProduct) => ({
                    productId:new mongoose.Types.ObjectId(cookieProduct.productId), // Convert to ObjectId
                    quantity: cookieProduct.quantity,
                })),
            });
        }

        const result = await Cart.find({ userId: req.user.id }).populate({
            path: 'products.productId',
            select: 'name , price',
        });

        res.status(201).json({
            status: 'success',
            documents: result.length,
            data: {
                result,
            },
        });
    } else {
        res.status(200).json({ cart: req.cookies.cart });
    }
});














// const checkProductInCart = ()=>{
//
// }
exports.addToCartAsGuest = catchAsync(async (req,res,next)=>{
    const {productId , quantity}= req.body;
    if(!req.user){
        if (await checkQuantity(productId,Product, quantity)) {
            if (!req.cookies.cart) {
                const cart = [{productId, quantity}]
                res.cookie('cart', cart, {
                    httpOnly: true,
                    maxAge: 20 * 60 * 1000
                }).status(200).json(cart)
            } else {
                let cart = req.cookies.cart;
                let updatedCart = cart.find(el => {
                    if (el.productId === productId) {
                        return el.productId === productId
                    }
                })
                if (updatedCart) {
                    if (updatedCart.quantity !== quantity) {
                        updatedCart.quantity = quantity;
                    }
                } else {
                    cart.push({productId, quantity});
                }

                res.cookie('cart', cart, {
                    httpOnly: true,
                    maxAge: 20 * 60 * 1000,
                });
            }
            res.status(200).json(req.cookies.cart)
        } else {
            return res.status(400).json({message: 'Your Quantity is not available'});
        }
    }
})
exports.deleteProductFromCartTrialVersion = catchAsync(async (req, res, next) => {
    if (!req.user) {
        let cartCookie = req.cookies.cart;
        cartCookie = cartCookie.filter((item) => item.productId !== req.params.id);
        res.cookie('cart', cartCookie, {
            httpOnly: true,
            maxAge: 20 * 60 * 1000,
        }).status(200).json(cartCookie);
    }else{
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { products: { productId: req.params.id } } },
            { new: true }
        );
        res.status(200).json(updatedCart);
    }
});

exports.deleteCartTrialVersion = catchAsync(async (req,res,next)=>{
    if(req.user) {
        await Cart.findByIdAndRemove(req.params.id)
        res.clearCookie('cart').status(204).json({
            status: 'success, deleted cart'
        });
    }else{
        res.clearCookie('cart').json({
            status: 'success, deleted cart',
        });
    }
})






exports.deleteCart = catchAsync(async (req,res,next)=>{
    if(req.user) {
        await Cart.findByIdAndRemove(req.params.id)
        res.status(204).json({
            status: 'success, deleted cart',
            data: null
        });
    }else{
        res.clearCookie('cart').json({
            status: 'success, deleted cart',
        });

    }
})


//#################### need to fix (to working without login)
// const mergedCartSessionWithDB = async (req)=>{
//     const cartFromDB = await Cart.findById(req.session.cart.userID);
//     const cartFromSession = req.session.cart;
//     if (!cartFromSession) {
//         return cartFromDB;
//     }
//     if (!cartFromDB) {
//         return cartFromSession;
//     }
//
//     const mergedCart = {
//         products: [...cartFromDB.products, ...cartFromSession.products],
//     };
//
//     return mergedCart;
// }
//
// exports.add = catchAsync(async (req, res, next) => {
//     // Check if the user is logged in.
//     if (!req.session.userId) {
//         // Create a new cart for the user and store it in the session variable.
//         const userID = uuidv4();
//         req.session.cart = { products: [], userID };
//     }
//
//     // Get the user's cart.
//     const cart = req.session.cart;
//
//     // Add the product to the user's cart.
//     const productId = req.body.productId;
//     const quantity = req.body.quantity;
//     if (await checkQuantity(productId, Product, quantity)) {
//         const productAlreadyInCart = cart.products.find((item) => {
//             return item.productId.toString() === productId.toString();
//         });
//
//         if (productAlreadyInCart) {
//             productAlreadyInCart.quantity += quantity;
//         } else {
//             cart.products.push({ productId, quantity });
//         }
//
//         // Update the user's cart in the database.
//         const existingCart = await Cart.findOne({ userID: req.session.userId });
//         if (!existingCart) {
//             await Cart.create({ userID: req.session.userId, products: cart.products });
//         }
//     }
//
//     // Merge the user's cart from the database with the cart in the session variable.
//     const mergedCart = await mergedCartSessionWithDB(req);
//     req.session.cart = mergedCart;
//
//     // Return the merged cart to the user.
//     res.json(mergedCart);
// });


exports.deleteProductCart = catchAsync(async (req, res, next) => {
    console.log(req.session)
    if(!req.session.userId ){
        next(new AppError('login please') , 404)
    }

    const productIdToDelete = req.params.id;
    req.session.userId.cart = await Cart.find({ products: { userId: req.session.userId }})

    const userId = req.user.id;
    try{
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { products: { productId: productIdToDelete } } },
            { new: true }
        );

        console.log('Updated Cart from Database:', updatedCart);

        // Update the session-based cart aaaaaaaaaaaaaaaaaaa with the aaaaaaaaaaaaaaaaaaa from the database
        req.session.userId.cart.products = updatedCart.products;

        res.status(204).json({
            status: 'success deleted',
        });
    }catch (err){
        res.status(500).json({
            status: 'try Again'
        });
    }
});



exports.addToCart = catchAsync(async (req, res, next) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    const userId = req.user.id;
    if (await checkQuantity(productId, Product, quantity)) {
        if(quantity === 0) next(new AppError('At least 1 piece' ,400 ));
        if (!req.session.cart) {
            req.session.cart = { products: [] };
        }
        let userCart;
        if (req.session.cart[userId]) {
            userCart = req.session.cart[userId];
        } else {
            userCart = { products: [] };
            req.session.cart[userId] = userCart;
        }
        const productAlreadyInCart = userCart.products.find((item) => {
            if(item.userId === req.params.userId) {
                return item.productId.toString() === productId.toString();
            }
        });

        if (productAlreadyInCart) {
            if (productAlreadyInCart.quantity !== quantity) {
                productAlreadyInCart.quantity = quantity;
            }else {
                res.json({message:"This Product Added Before"})
            }
        } else {
            userCart.products.push({ productId, quantity });
        }

        if (req.user && req.user.id) {
            await Cart.findOneAndUpdate(
                { userId: req.user.id },
                { products:userCart.products },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({ cart: userCart });
    }

    return res.status(400).json({ message: 'Your Quantity is not available' });
});
