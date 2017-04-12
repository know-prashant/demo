'use strict';
const nodemailer = require('nodemailer');
const config = require('../../config.js');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
});

// setup email data with unicode symbols
// let mailOptions = {
//     from: config.email.from, // sender address
//     to: 'prashant.yadav@ahytech.com', // list of receivers
//     subject: 'testing', // Subject line
//     text: 'Hello world ?', // plain text body
//     html: '<b>Hello world ?</b>' // html body
// };

// send mail with defined transport object
module.exports.sendUserMail = function (mailOptions, callback){
  transporter.sendMail(mailOptions, callback)
}

//transporter.sendMail(mailOptions, callback);
