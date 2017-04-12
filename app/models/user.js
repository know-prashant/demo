var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

//user details schema
// var UserDetailsSchema = new Schema({
//   _user:{
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   name:{
//     type: String,
//     required: [true, 'user name required'],
//   },
//   designation: {
//     type: String,
//     required: [true, 'user designation required'],
//     default: null,
//   },
//   company: {
//     type: String,
//     default: null
//   },
//   image: {
//     type: String
//   }
// },{ versionKey: false });

// user schema
var UserSchema = new Schema({
  _user: Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: {unique: true},
    required: [true, 'user email address required'],
    validate: {
      validator: function(email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: '{VALUE} is not a valid email address!'
     },
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
  //  select: false   // do not select in query by default
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    date:{
      type: Date
    },
    platform:{
      type: String
    }
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  platform:{
    type: String,
    required: [true, 'user platform is requierd']
  },
  device:[{
    token:{
      type:String
    },
    platform:{
      type:String,
      required: [true, 'user device platform is required']
    },
    model:{
      type: String
    }
  }],
  name:{
    type: String
  },
  designation: {
    type: String
  },
  company: {
    type: String
  },
  image: {
    type: String
  },
  invited:{
    type: Number,
    min: 0,
    max: 2,
    default:0
  }
}, { versionKey: false });



// hash the password before the user is saved
UserSchema.pre('save', function(next) {
  var user = this;

  // hash the password only if the password has been changed or user is new
  if (!user.isModified('password')) return next();

  // generate the salt
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);

    // change the password to the hashed version
    user.password = hash;
    next();
  });
});

// method to compare a given password with the database hash
UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// method to compare a given user is verified user
UserSchema.methods.isVerifiedUser = function(cb) {
    if(this.is_verified){
      cb(true);
    }else{
      cb(false);
    }
};


var User = mongoose.model('User', UserSchema);
// var UserDetails = mongoose.model('UserDetails', UserDetailsSchema);
module.exports = {
  User: User,
  // UserDetails: UserDetails
};
