require('dotenv').config({path:'../config.env'});
const fs = require('fs');
const path = require("path");
const product = require('../Model/productModel')
const mongoose = require("mongoose");
const DB = process.env.DB_URL.replace('<password>' , process.env.DB_PASSWORD)

const productsData = JSON.parse(fs.readFileSync(path.join(__dirname , 'data' , 'productsJson.json') , 'utf-8'));

const connectDB = async () =>{
    try{
        await mongoose.connect(DB , {
            useNewUrlParser: true,
        })
        console.log('DB connected');
    }catch (err){
        console.log(err);
    }
}

const exportDB = async ()=>{
    try {
        await product.create(productsData);
        console.log('success created');
        process.exit()
    }catch (e){
        console.log(e)
    }
}


connectDB()
    .then(exportDB)