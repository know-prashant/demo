var UserModel = require('../models/user');
var Friend = require('../models/friend').Friend;
var Group = require('../models/group').Group;
var Helper = require('../utils/helper');
var Response = require('../utils/response');
var Email = require('../utils/email');
var config = require('../../config');
var User = UserModel.User;
var success = Response.success;
var failure = Response.failure;
var checkDuplicate = Helper.checkDuplicateInArray;


//check if user is admin
exports.check_admin = function(req, res, next){
  //throw error if admin id is missing
  if(!req.body.admin_id){
    return res.send(failure('admin id is required'));
  }

  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is missing in params'));
  }

  Group.findById(req.params.id, function(err, group){
    //throw err
    if(err) return res.send(failure(err));

    //if no group found then throw error
    if(!group) return res.send(failure('no group found'));
    var isAdmin = false;
    group.member.forEach(function(v){
      if(v.id == req.body.admin_id){
        if(v.is_admin){
          isAdmin = true;
        }
      }
    });

    if(isAdmin){
      next();
    }else{
      return res.send(failure("need admin rights"));
    }

  });
};


//create group
exports.create = function(req, res){
  //throw error if name is missing
  if(!req.body.name){
    return res.send(failure('group name is required'));
  }

  //throw error if creator id is missing
  if(!req.body.creator_id){
    return res.send(failure('group creator id is required'));
  }

  //throw error if creator name is missing
  if(!req.body.creator_name){
    return res.send(failure('group creator name is required'));
  }

  //throw error if creator name is missing
  if(!req.body.member_ids){
    return res.send(failure('group members are required'));
  }

  //check duplicate member ids
  if(checkDuplicate(req.body.member_ids)){
    return res.send(failure('input contains duplicate member ids'));
  }

  //craete group data
  var group = new Group();
  group.name = req.body.name;
  group.created_by.id = req.body.creator_id;
  group.created_by.name = req.body.creator_name;
  group.updated_by.push({id:req.body.creator_id, name:req.body.creator_name});
  if(req.body.image)group.image = req.body.image;
  req.body.member_ids.forEach(function(ids){
    group.member.push({id: ids});
  });

  //add creator also in member list and make him admin
  group.member.push({id: req.body.creator_id, is_admin:true});

 //save group data
  group.save(function(err){
    if(err) return res.send(failure(err));
    return res.send(success('group created', group));
  });
};


//update group
exports.update = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

   //if body is null then throw error
   if(!req.body){
     return res.send(failure('need data to update'));
   }

   //throw error if admin id is missing
   if(!req.body.admin_id){
     return res.send(failure('need admin id to update'))
   }

   //throw error if admin name is missing
   if(!req.body.admin_name){
     return res.send(failure('need admin name to update'))
   }

  Group.findById(req.params.id, function(err, group){
    //throw err
    if(err) return res.send(failure(err));

    //throw error if no group found
    if(!group) return res.send(failrue('no group found'));

    //update group params
    if(req.body.name) group.name = req.body.name;
    if(req.body.image) group.image = req.body.image;
    group.updated_by.id = req.body.user_id;
    group.updated_by.name = req.body.user_name;
    group.updated_by.date = Date.now();
    group.updated_at = Date.now();

    //save group
    group.save(function(err){
      //throw error
      if(err) return res.send(err);

      //success
      return res.send(success('group update', group));
    });

  });
};


//add members in group
exports.add_member = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //throw error if no data
  if(!req.body.member_ids){
    return res.send(failure('need member ids to add'));
  }

  Group.findById(req.params.id, function(err, group){
    //throw err
    if(err) return res.send(failure(err));

    //throw error if no group found
    if(!group) return res.send(failrue('no group found'));

    //check if member is already present or not
    group.hasMember(req.body.member_ids, function(isMatch){
      if(isMatch){
        return res.send(failure('member already present in the group'));
      }
    });

    //add members
    req.body.member_ids.forEach(function(v){
      group.member.push({id: v});
    });

    //save group
    group.save(function(err){
      //throw error
      if(err) return res.send(err);

      //success
      return res.send(success('Members added in group', group));
    });

  });
};

//update members in group
exports.update_member = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //throw error if no data
  if(!req.body.member_id){
    return res.send(failure('need member ids to update'));
  }

  //throw error if role is missing
  if(req.body.is_admin == null){
    return res.send(failure('is admin is required'));
  }

  //throw error if is_admin is not Boolean
  if(typeof(req.body.is_admin) !== 'boolean'){
    return res.send(failure('is admin can only be boolean'));
  }

  //check if a friend list is already present
  Group.findOneAndUpdate({'_id': req.params.id, "member.id": req.body.member_id}  , {$set: {"member.$.updated_at": Date.now(),"member.$.is_admin": req.body.is_admin}}, {new: true}, function(err, group){
    //error
    if (err) return res.send(failure(err));

    //if no group found
    if(!group){
       return res.send(failure('No group found with this id'));
    }

    // Success
      return res.send(success('member updated',group));

  });

};

//remove members from group
exports.remove_member = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //throw error if no data
  if(!req.body.member_id){
    return res.send(failure('need member ids to remove'));
  }

  //check if a friend list is already present
  Group.findOneAndUpdate({'_id': req.params.id}, {$pull: {"member":{id: req.body.member_id}}}, {new: true}, function(err, group){
    //error
    if (err) return res.send(failure(err));

    //if no group found
    if(!group){
       return res.send(failure('No group found with this id'));
    }

    // Success
      return res.send(success('member removed',group));

  });

};


//get group
exports.get = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //check if a friend list is already present
  Group.findById(req.params.id, function(err, group){
    //error
    if (err) return res.send(failure(err));

    //if no group found
    if(!group){
       return res.send(failure('No group found with this id'));
    }

    // Success
      return res.send(success('group found',group));

  });
};


//Delete group
exports.remove = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //check if a friend list is already present
  Group.findByIdAndRemove(req.params.id, function(err){
    //error
    if (err) return res.send(failure(err));

    // Success
      return res.send(success('group deleted',null));
  });

};

//get group for specific users
exports.get_by_member = function(req, res){
  //throw error if group id is missing
  if(!req.params.id){
    return res.send(failure('group id is required'));
  }

  //check if a friend list is already present
  Group.find({"member.id":req.params.id}, function(err, groups){
    //error
    if (err) return res.send(failure(err));

    // Success
      return res.send(success('group found',groups));
  });

};
