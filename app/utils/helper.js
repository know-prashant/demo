module.exports.randomString = function (length){
  var chars = "0123456789";
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

module.exports.validatePlatform = function (platform){
  if(platform.toLowerCase() != 'email' && platform.toLowerCase() != 'gplus' && platform.toLowerCase() != 'ln'){
    return false;
  }
  return true;
}

module.exports.checkDuplicateInArray = function(arr){
    //if not array return false
    if(!arr instanceof Array){
      return false;
    }

    var count = 0;
    arr.forEach(function(v){
        arr.forEach(function(v2){
            if(v == v2){
              count+=1;
            }
        });
        if(count <= 1){
          count = 0;
        }
    });
    
    if(count > 0){
     return true;
    }

    return false;
};
