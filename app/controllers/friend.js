var UserModel = require('../models/user');
var Friend = require('../models/friend').Friend;
var Helper = require('../utils/helper');
var Response = require('../utils/response');
var Email = require('../utils/email');
var config = require('../../config');
var User = UserModel.User;
var UserDetails = UserModel.UserDetails;
var success = Response.success;
var failure = Response.failure;
var checkDuplicate = Helper.checkDuplicateInArray;

//Add Friend
exports.create = function(req, res) {
  //throw error for missing user_id
  if(!req.body.user_id){
    return res.send(failure('user id is required'));
  }

  //throw error for missing friend_id
  if(!req.body.friend_id){
    return res.send(failure('friends id is required'));
  }

  //check if a friend list is already present
  Friend.findOne({'_user': req.body.user_id}, function(err, user){
    //error
    if (err) return res.send(failure(err));
    var friend;

    //if no friend list
    if(!user){
        //create friend list
        friend = new Friend({
           _user: req.body.user_id,
           friend:[{
             id:req.body.friend_id,
             status:"pending"
           }]
        });
     }else{
       //if friend list then update friend list
       friend = user;

       //check if friend exists
       user.hasFriend(req.body.friend_ids, function(isMatch){
          res.send(failure('friend already exists'));
       });
       return;

       friend.friend.push({
         id:req.body.friend_id
       });
     }

    // Save created friend
    friend.save(function(err) {
      if(err){
        //error
        // friend already exists
        res.send(err);
        return;
        if(err.code == 11000){
          return res.status(403).json(failure('Failed. A Friend with that id already exists.'));
        }else{
          if(err) res.send(failure(err));
        }
      }else{
      // Success

       //update user invited count;
        User.findByIdAndUpdate(friend._user, { $inc: { invited: 1 }}, function(err){
          if(err) return res.json(failure('error update user invited count'));
        });

        res.json(success('friend request created',friend));
     }
    });
   });
};

//Add Friend in bulk
exports.bulk_create = function(req, res) {
  //throw error for missing user_id
  if(!req.body.user_id){
    return res.send(failure('user id is required'));
  }

  //throw error for missing friend_id
  if(!req.body.friend_ids){
    return res.send(failure('friend ids are required'));
  }

  //throw error for duplicate friend ids
  if(checkDuplicate(req.body.friend_ids)){
    return res.send(failure('input contains duplicate friend ids'));
  }

  //check if a friend list is already present
  Friend.findOne({'_user': req.body.user_id}, function(err, user){
    //error
    if (err) return res.send(failure(err));
    var friend;

    //if no friend list
    if(!user){
        //create friend list
        var friends = [];
        for(friend_id in req.body.friend_ids){
          friends.push({id:req.body.friend_ids[friend_id]});
        }
        friend = new Friend({
           _user: req.body.user_id,
           friend:friends
        });
     }else{

       friend = user;

       //check if friend already exists
       user.hasFriend(req.body.friend_ids, function(isMatch){
          res.send(failure('friend already exists'));
       });
       return;

       //create friend list
       for(friend_id in req.body.friend_ids){
         friend.friend.push({
           id:req.body.friend_ids[friend_id]
         });
       }
     }

    // Save created friend
    friend.save(function(err) {
      if(err){
        if(err) res.send(failure(err));
        //error
        // friend already exists
        if(err.code == 11000){
          return res.status(403).json(failure('Failed. A Friend with that id already exists.'));
        }else{
          if(err) res.send(failure(err));
        }
      }else{
      // Success

      //update user invited count;
       User.findByIdAndUpdate(friend._user, { $inc: { invited: req.body.friend_ids.length }}, function(err){
         if(err) return res.json(failure('error update user invited count'));
       });

       res.json(success('friend request created',friend));
     }
    });
   });
};

//accept Friend
exports.accept = function(req, res) {
  //throw error for missing user_id
  if(!req.params.user_id){
    return res.send(failure('user id is required'));
  }

  //throw error for missing friend_id
  if(!req.body.friend_id){
    return res.send(failure('friends id is required'));
  }

  //check if a friend list is already present
  Friend.findOneAndUpdate({'_user': req.params.user_id, "friend.id": req.body.friend_id}  , {$set: {"friend.$.status": 'accepted', "friend.$.updated_at": Date.now()}}, {new: true}, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //if no friend list
    if(!user){
       return res.send(failure('No user found with this id'));
    }

    // Success
      res.json(success('friend request accepted',user));

   });
};

//accept Friend
exports.bulk_accept = function(req, res) {
  //throw error for missing user_id
  if(!req.params.user_id){
    return res.send(failure('user id is required'));
  }

  //check if a friend list is already present
  Friend.findOne({'_user': req.params.user_id}, function(err, user){

    //error
    if (err) return res.send(failure(err));

    //if no friend list
    if(!user){
       return res.send(failure('No user found with this id'));
    }

    //update friends with pending requests
    user.friend.forEach(function(v,i){
      if(v.status == 'pending'){
        user.friend[i].status = 'accepted';
        user.friend[i].updated_at = Date.now();
      }
    });

    //save updated user
    user.save(function(err){
      if(err) return res.send(failure('there was error in accpeting friend requests'));
      // Success
      return res.json(success('friend request accepted',user));
    })


   });
};


//get Friend
exports.get = function(req, res) {
  //throw error for missing user_id
  if(!req.params.user_id){
    return res.send(failure('user id is required'));
  }

  //check if a friend list is already present
  Friend.findOne({'_user': req.params.user_id}, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //if no friend list
    if(!user){
       return res.send(failure('No user found with this id'));
    }

    // Success
      res.json(success('users friend list',user));
   });
};

//remove Friend
exports.remove = function(req, res) {
  //throw error for missing user_id
  if(!req.body.user_id){
    return res.send(failure('user id is required'));
  }

  //throw error for missing friend_id
  if(!req.body.friend_id){
    return res.send(failure('friends id is required'));
  }

  //check if a friend list is already present
  Friend.findOneAndUpdate({'_user': req.params.user_id}, { $pull: { 'friend': { id: req.body.friend_id} } }, function(err, user){
    //error
    if (err) return res.send(failure(err));

    //if no friend list
    if(!user){
       return res.send(failure('No user found with this id'));
    }

    // Success
    res.json(success('users removed from friend list',user));

   });
};
