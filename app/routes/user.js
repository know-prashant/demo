const express = require('express');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var user = require('../controllers/user');
const router = express.Router();;

// router.get('/signup', User.load);

//Signup
router.post('/signup', user.create);

//login for existing user else create a new one
router.post('/signin', user.login);

//login for existing user else create a new one
router.post('/social_signin', user.social_login);

//verify user
router.post('/verify', user.verify);

//update user
router.put('/:id', user.update);

//get user
router.get('/:id', user.getById);

//Get user Details by user id
//router.get('/details/:id', user.getDetailsByUserId);

//Get All user details
//router.get('/details', user.getDetails);

//Add user Details
//router.post('/details', user.createDetails);

//update user Details
//router.put('/details/:id', user.updateDetails);

//resend OTP
router.post('/resendotp', user.resendOTP);

module.exports = router;
