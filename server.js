require('dotenv').config({path:'./config.env'});
const app = require('./app')
const mongoose = require('mongoose')
const PORT = 4000 ;
const DB = process.env.DB_URL.replace('<password>' , process.env.DB_PASSWORD)
const connection = ()=>{
    try {
        mongoose.connect(DB , {
            useNewUrlParser: true,
        })
        app.listen(PORT , ()=>{
            console.log('connecting to DB',`\nServer Listening on PORT: ${PORT}`);
        })
    }catch (err){
        console.log(err);
        process.exit();
    }
}

connection();