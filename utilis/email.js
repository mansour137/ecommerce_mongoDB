require('dotenv').config({path:'./config.env'})
const nodemailer = require('nodemailer');

const sendEmail = async (option) =>{
    //create transporter
    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASSWORD
        }
    });

    const mailOption ={
        from: 'SUPPORT ',
        to:option.email,
        subject:option.subject,
        text : option.message,
        // html :
    };
    await transport.sendMail(mailOption)
}

module.exports = sendEmail;