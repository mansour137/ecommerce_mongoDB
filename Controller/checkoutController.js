const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../Model/cartModel');
const Product = require('../Model/productModel')
const myOrder = require('../Model/my0rderModel');
const adminOrder = require('../Model/adminOrdersModel');
const mongoose = require('mongoose')
const catchAsync = require('../utilis/catchAsync');

//checkout to apply must be the user logged
//if user add new products in cart as a guest then when logged there's also products in his cart DB
//loop through cart of cookie to add the different products to CART DB

exports.checkoutSessionTrialVersion = catchAsync(async (req, res, next) => {
    // let cart = await Cart.findById(req.params.cartId);
    // console.log(cart.products); // Debug
    let DB_cart = await Cart.findById(req.params.cartId);
    console.log('db-cart=>' , DB_cart)
    let updatedCart = [];
    if(req.cookies.cart){
        const cookieCart = req.cookies.cart;
        for (const cookieProduct of cookieCart) {
            const matchingProduct = DB_cart.products.find((product) => {
                return product.productId._id.toString() === cookieProduct.productId;
            });

            if (matchingProduct) {
                if (matchingProduct.quantity !== cookieProduct.quantity) {
                    matchingProduct.quantity = cookieProduct.quantity;
                }
            } else {
                DB_cart.products.push({
                    productId: cookieProduct.productId,
                    quantity: cookieProduct.quantity,
                });
            }
        }
        await DB_cart.save();
    }

    const customer = await stripe.customers.create({
        metadata:{
            userId: DB_cart.userId.toString(),
            cartId:req.params.cartId,
            cart:JSON.stringify(DB_cart.products)
        }
    })
// res.json({result:DB_cart.products})
console.log( 'DB_cart.products',DB_cart.products)
    const lineItems = DB_cart.products.map((item) => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.productId.name,
                    image:item.productId.imageCover
                },
                unit_amount: item.productId.price * 100,
            },
            quantity: item.quantity,
        };
    });
console.log( 'lineItems:=> ', lineItems)
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/api/v1/myOrders`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/v1/products`,
            client_reference_id: req.params.cartId,
            line_items: lineItems,
            customer:customer.id,
            mode: 'payment',
        });

        res.status(200).json({ session });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a checkout session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    let cart = await Cart.findById(req.params.cartId);
    console.log(cart.products); // Debug
    const customer = await stripe.customers.create({
        metadata:{
            userId: cart.userId.toString(),
            cartId:req.params.cartId,
            cart:JSON.stringify(cart.products)
        }
    })


    const lineItems = cart.products.map((item) => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.productId.name,
                    image:item.productId.imageCover
                },
                unit_amount: item.productId.price * 100,
            },
            quantity: item.quantity,
        };
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/api/v1/myOrders`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/v1/products`,
            client_reference_id: req.params.cartId,
            line_items: lineItems,
            customer:customer.id,
            mode: 'payment',
        });

        res.status(200).json({ session });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Handle Stripe webhook events
const createOrderUserAndAdmin = async (customer ,data) =>{
    const customerParsed = JSON.parse(customer.metadata.cart);
    // console.log('customerParsed:' , customerParsed)
    let productItems = [];

    for (const item of customerParsed) {
        productItems.push({
            productDetail: item.productId,
            quantity: item.quantity,
        });
    }

    console.log('customerParsed:' , customerParsed)
    console.log('productItems:' , productItems)

    const order = await myOrder.create({
        paymentStatus: data.payment_status,
        payment_intent_ID:data.payment_intent,
        userId:customer.metadata.userId,
        products: productItems,
    })
    const adminOrders = await adminOrder.create({
        paymentStatus: data.payment_status,
        payment_intent_ID: data.payment_intent,
        userId: customer.metadata.userId,
        products: productItems,
    });
    try {
        // console.log('customerParsed:' , customerParsed)
        // console.log('productItems:' , productItems)

        console.log("Processed Order (user):", order);
        console.log("Processed Order (Admin):", adminOrders);
    } catch (err) {
        console.log(err);
    }
}
const updateStorage = async (cart)=>{
    const products = JSON.parse(cart.metadata.cart);
    for (const product of products) {
        const originalQuantity = await Product.findById(product.productId._id);
        const actuallyQuantity = Math.max((originalQuantity.quantity - product.quantity) , 0);
        await Product.findByIdAndUpdate(product.productId._id , {quantity : actuallyQuantity})
    }
    console.log('updated success');
}

exports.handleStripeWebhook = catchAsync(async (req, res) => {
    console.log('enter in ================>handleStripeWebhook');
    let data;
    let eventType;
    // Check if webhook signing is configured.
    let webhookSecret;
    webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed:  ${err}`);
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data.object;
        eventType = event.type;
    }
    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
        res.clearCookie('cart');
        await stripe.customers
            .retrieve(data.customer)
            .then(async (customer) => {
                try {
                    await Cart.findByIdAndDelete(data.client_reference_id);
                    await updateStorage(customer);
                    await createOrderUserAndAdmin(customer,data);
                    console.log('customer:',customer);
                    console.log('aaaaaaaaaaaaaaaaaaa:',data);
                } catch (err) {
                    console.log(err);
                }
            })
            .catch((err) => console.log(err.message));
    }

    res.status(200).end();
})
