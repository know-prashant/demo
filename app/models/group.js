var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var UserModel = require('./user.js');
var User = UserModel.User;

//group schema
var groupSchema = new Schema({
  name:{
    type: String,
    required: true,
  },
  member:[{
    id:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    created_at:{
      type: Date,
      default: Date.now
    },
    updated_at:{
      type: Date,
      default: Date.now
    },
    is_admin:{
      type:Boolean,
      required: true,
      default: false
    }
  }],
  created_at:{
    type: Date,
    default: Date.now()
  },
  update_at:{
    type: Date,
    default: Date.now()
  },
  created_by:{
    id: {
     type: Schema.Types.ObjectId,
     ref: 'User',
     required: true
   },
   name: {
     type: String,
     required: true
   }
  },
  updated_by:[{
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now()
    }
  }],
  image:{
    type: String,
    default: null
  }
}, { versionKey: false });


// method to check if the member is admin
groupSchema.methods.isAdmin = function(member_id,cb) {
  var isAdmin = false;
  this.member.forEach(function(v){
      if(v.id == member_id){
        if(v.is_admin){
          isAdmin = true;
        }
      }
    });

    console.log(isAdmin);
  cb(isAdmin);
};

// method to check if memeber is already present
groupSchema.methods.hasMember = function(member_id, cb) {
    var hasMember = false;
    var group = this;
    //if member id is not present return false
    if(!member_id) cb(false);

    if(member_id instanceof Array){
      member_id.forEach(function(v){
        group.member.forEach(function(data){
          if(v == data.id){
            hasMember = true;
          }
        });
      });
      //for single Value
    }else{
       group.member.forEach(function(v){
         if(v.id == member_id){
           hasMember = true;
         }
       });
    }

    cb(hasMember);
};

var Group = mongoose.model('Group', groupSchema);
module.exports = {
  Group: Group
};
