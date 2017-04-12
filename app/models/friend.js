var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var UserModel = require('./user.js');
var User = UserModel.User;

//friends schema
var friendsSchema = new Schema({
  _user:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: { unique: true }
  },
  friend:[{
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
    status:{
      type:String,
      required: true,
      default: "pending"
    }
  }]
}, { versionKey: false });


// method to check if the user has particular friend
friendsSchema.methods.hasFriend = function(friend_id,cb) {
  var friend = this;
  var hasFriend = false;
  if(!friend_id) cb(false);
 //if no friends then return true
  if(!this.friend) cb(false);

 //Check if user has friend with id
 //for array
 if(friend_id instanceof Array){
   friend_id.forEach(function(v){
     friend.friend.forEach(function(data){
       if(v == data.id){
         hasFriend = true;
       }
     });
   });
   //for single Value
 }else{
    friend.friend.forEach(function(v){
      if(v.id == friend_id){
        hasFriend = true;
      }
    });
 }
    cb(hasFriend);
};

var Friend = mongoose.model('Friend', friendsSchema);
module.exports = {
  Friend: Friend
};
