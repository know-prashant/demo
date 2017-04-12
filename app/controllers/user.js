var UserModel = require('../models/user');
var Helper = require('../utils/helper');
var Response = require('../utils/response');
var Email = require('../utils/email');
var config = require('../../config');
var User = UserModel.User;
// var UserDetails = UserModel.UserDetails;
var success = Response.success;
var failure = Response.failure;
var otpLength = config.otp_length;
var validatePlatform = Helper.validatePlatform;

//create user
exports.create = function(req, res) {
  //Generate OTP
  var OTP = Helper.randomString(otpLength);
  // Create a new user
  var user = new User({
     email: req.body.email,
     password: OTP,
     platform: req.body.platform,
     last_login: {
       platform: req.body.platform
     },
     device:[{
       platform: req.body.device_platform,
       token: req.body.device_token,
       model: req.body.device_model
     }]
  });
  // Save created User
  user.save(function(err) {
    if(err){
      //error
      // Username already exists
      if(err.code == 11000){
        return res.status(403).json(failure('Failed. A user with that username already exists.'));
      }else{
        if(err) res.send(failure(err));
      }
    }else{
    // Success
      exports.sendOTP(user, OTP, function(err, info){
        if (err) {
            res.send(failure(err));
        }else{
            res.json(success('user created',user));
        }
      });
   }
  });
};

//create social user
exports.create_social_user = function(req, res) {
  // Create a new user
  var user = new User({
     email: req.body.email,
     platform: req.body.platform,
     is_verified: true,
     last_login: {
       platform: req.body.platform
     },
     device:[{
       platform: req.body.device_platform.toLowerCase(),
       token: req.body.device_token,
       model: req.body.device_model
     }]
  });
  // Save created User
  user.save(function(err) {
    if(err){
      // Username already exists
      if(err.code == 11000){
        //error
        return res.status(403).json(failure('Failed. A user with that username already exists.'));
      }else{
        if(err) res.send(failure(err));
      }
    }else{
    // Success
      res.json(success('user created',user));
   }
  });
};

//create user
exports.social_login = function(req, res) {

  // check user
    if(!req.body.email){
      return res.send(failure('email id is required'));
    }

    //check platform
    if(!req.body.platform){
      return res.send(failure('user platform is required'));
    }else if(!validatePlatform(req.body.platform)){
      return res.send(failure('user platform is not valid'));
    }

    //check device details
    if(!req.body.device_token)return res.send(failure('user device token is required'));
    if(!req.body.device_platform)return res.send(failure('user device platform is required'));
    if(!req.body.device_model)return res.send(failure('user device model is required'));

    // Find user with email
    User.findOne({'email': req.body.email}, {'password': 0}, function(err, user){
      if (err) return res.send(failure(err));

      //if no user found
      if(!user){
        // Create a new user
          exports.create_social_user(req, res);
          return;
      }

      //if user login's from new platform
      if(!user.platform.includes(req.body.platform)){
        //update the user platform
        user.platform.push(req.body.platform);
        if(!user.is_verified)user.is_verified = true;
        user.save(function(err){
          if(err) return res.send(failure(err));
           res.send(success('user logged in with new social platform', user));
        });
        return;
      }
      //if user is already verified
      if(user.is_verified){
        user.last_login.date = Date.now();
        user.last_login.platform = req.body.platform;

        //check id user has logged in from new device
        var device_exist = false;
        user.device.forEach(function(v){
          if(v.token == req.body.device_token  && v.platform == req.body.device_platform && v.model == req.body.device_model){
            device_exist = true;
          }
        });

        if(!device_exist){
          user.device.push({
            token: req.body.device_token,
            platform: req.body.device_platform.toLowerCase(),
            model: req.body.device_model
          });
        }

        //save user
        user.save(function(err){
            if(err) return res.send(failure(err));
        });
        return res.json(success('user verified', user));

      }else{
        return res.send(failure('not a verified social user'));
      }

    });
};

//create user
exports.login = function(req, res) {

  // check user
    if(!req.body.email){
      return res.send(failure('email id is required'));
    }

    //if platform is missing or is invalid
    if(!req.body.platform){
      return res.send(failure('user platform is required'));
    }else if(!validatePlatform(req.body.platform)){
      return res.send(failure('user platform is not valid'));
    }

    //check device details
    if(!req.body.device_token)return res.send(failure('user device token is required'));
    if(!req.body.device_platform)return res.send(failure('user device platform is required'));
    if(!req.body.device_model)return res.send(failure('user device model is required'));


    // Find user with email
    User.findOne({'email': req.body.email}, {'password': 0}, function(err, user){
      if (err) return res.send(failure(err));

      //if no user found
      if(!user){
        //create user
        exports.create(req, res);
        return;
      }

      //if user login's from new platform
      if(!user.platform.includes(req.body.platform)){
        //update the user platform
        user.platform.push(req.body.platform);

        user.save(function(err){
          if(err) return res.send(failure(err));
          res.send(success('user logged in with email platform', user));
          return;
        });
      }

      //if user is already verified
      if(user.is_verified){
        user.last_login.date = Date.now();
        user.last_login.platform = req.body.platform;
        var device_exist = false;
        user.device.forEach(function(v){
          if(v.token == req.body.device_token  && v.platform == req.body.device_platform && v.model == req.body.device_model){
            device_exist = true;
          }
        });

        if(!device_exist){
          user.device.push({
            token: req.body.device_token,
            platform: req.body.device_platform,
            model: req.body.device_model
          });
        }

        //save user data
        user.save(function(err){
          if(err) return res.send(failure(err));
        });

        //friends suggestion list
        if(user.invited < 2){
          var suggestionList;
          //get user email domain
          var userEmail = user.email.split('@')[1];

          //find user's with same domain
          User.find({email: {$regex: userEmail, $options: 'si', $ne: user.email }}).select('email last_login is_verified platfrom device name designation company image').limit(10).exec(function(err, data){
            if(err) return res.send(failure(err));
            suggestionList = {'user':user, 'suggestion': data};
            return res.json(success('user successfully logged in', suggestionList));
          });

        }else{
          res.json(success('user successfully logged in', {'user':user, 'suggestion': []}));
        }
      }else{
        return res.send(failure('not a verified user'));
      }

    });
};

//Update User
exports.update = function(req, res) {
  // update a user
  User.findById(req.params.id, {'password': 0}, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //user not found
    if(!user) return res.status(403).send(failure('user not found for this  id'));
    if(req.body.name) user.name = req.body.name;
    if(req.body.designation) user.designation = req.body.designation;
    if(req.body.company) user.company = req.body.company;
    if(req.body.image) user.image = req.body.image;

    user.updated_at = Date.now();
    // Save updated User
    user.save(function(err) {
      if(err){
        //error
        res.send(failure(err));
      }else{
        // Success
        res.json(success('user updated', user));
      }
    });
  });
}

//get User by id
exports.getById = function(req, res) {
  // update a user
  User.findById(req.params.id, {'password': 0}, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //user not found
    if(!user) return res.status(403).send(failure('user not found for this  id'));

    //success
    res.json(success('user', user));

  });
}

//Verify User OTP
exports.verify = function(req, res) {
  //if otp is missing
  if (!req.body.otp){
    return res.send(failure('OTP is required'));
  }

  //if email is missing
  if (!req.body.email){
    return res.send(failure('email is required'));
  }

  // Find user with email
  User.findOne({'email': req.body.email}, function(err, user){
    if (err) return res.send(failure(err));

    //if user is already verified
    if(user.is_verified){
      return res.send(failure('user is already verified'));
    }

    // Save updated User
    user.verifyPassword(req.body.otp, function(err, isMatch) {
      if(err){
        //error
        res.send(failure(err));
      }else if(isMatch){

        // Success if otp matches
        user.is_verified = true;
        user.updated_at = Date.now();
        user.save(function(err) {
          if(err){
            //error
            res.send(failure(err));
          }else{
            // Success
            res.json(success('user verified', user));
          }
        });
        // res.json({message: 'user verified', user: user});
      }else{
          //failure if otp doesnot matches
           res.json(failure('incorrect OTP'));
      }
    });
  });
}

//Get User Details
// exports.getDetails = function(req, res) {
//
//   // Get a user details
//   UserDetails.find(function(err, userDetails){
//     //error
//     if (err) return res.send(failure(err));
//
//     //No userdetails found
//     if(!userDetails) return res.status(403).json(failure('user details not found'));
//
//     //success
//     res.json(success('user details found', userDetails));
//   });
//
// }

//Get User Details by User id
// exports.getDetailsByUserId = function(req, res) {
//   //User id is required
//   if(!req.params.id) return res.send(failure('user id is reqired'));
//
//   // Get a user details
//   UserDetails.findOne({'_user': req.params.id}, function(err, userDetails){
//     //error
//     if (err) return res.send(failure(err));
//
//     //No userdetails found
//     if(!userDetails) return res.status(403).json(failure('user details not found'));
//
//     //success
//     res.json(success('user details found', userDetails));
//   });
//
// }


//Insert User Details
// exports.createDetails = function(req, res) {
//
//   // add a user details
//   var userDetails = new UserDetails();
//   if(req.body.user_id) userDetails._user = req.body.user_id;
//   if(req.body.name) userDetails.name = req.body.name;
//   if(req.body.designation) userDetails.designation = req.body.designation;
//   if(req.body.company) userDetails.company = req.body.company;
//   if(req.body.image) userDetails.image = req.body.image;
//   // Save created User details
//   userDetails.save(function(err) {
//     if(err){
//       //error
//       res.send(failure(err));
//     }else{
//       // Success
//       res.json(success('user details added', userDetails));
//    }
//   });
// }


//Update User Details
// exports.updateDetails = function(req, res) {
//   if(!req.params.id) return res.send(failure('ID is required'));
//   // update a user
//   UserDetails.findById(req.params.id, function(err, userDetails){
//     //error
//     if (err) return res.send(failure(err));
//
//     //No user details found
//     if(!userDetails) return res.send(failure('user details not found'));
//
//     if(req.body.name) userDetails.name = req.body.name;
//     if(req.body.designation) userDetails.designation = req.body.designation;
//     if(req.body.company) userDetails.company = req.body.company;
//     if(req.body.image) userDetails.image = req.body.image;
//
//     // Save updated User
//     userDetails.save(function(err) {
//       if(err){
//         //error
//         res.send(failure(err));
//       }else{
//         // Success
//         res.json(success('user details updated', userDetails));
//       }
//
//     });
//
//   });
//
// }

//Resend OTP
exports.resendOTP = function(req, res) {
  //Generate OTP
  var OTP = Helper.randomString(otpLength);
  // update a user
  User.findOne({'email': req.body.email}, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //if no user found
    if(!user) return res.send(failure('no user found'));

    //Updated password
    user.password = OTP;

    user.updated_at = Date.now();
    // Save updated User
    user.save(function(err) {
      if(err){
        //error
        res.send(failure(err));
      }else{
        // Success
        exports.sendOTP(user, OTP, function(err, info){
          if (err) {
              res.send(failure(err));
          }else{
              res.json(success('otp resended', user));
          }

        });

      }

    });

  });

}

//send OTP
exports.sendOTP = function(user, OTP, callback) {
  let mailOptions = {
    from: config.email.from, // sender address
    to: 'prashant.yadav@ahytech.com', // list of receivers
    subject: 'testing', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>'+OTP+'</b>' // html body
  };
  Email.sendUserMail(mailOptions, callback);
};
