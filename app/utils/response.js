module.exports.success = function(msg, data){
  var success = {
    'success': true,
    'message': msg,
    'data': data
  }
  return success;
}

module.exports.failure = function(msg){
  var failure = {
    'success': false,
    'message': msg
  }
  return failure;
}
