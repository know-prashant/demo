const express = require('express');
var group  = require('../controllers/group');
const router = express.Router();;

// router.get('/signup', User.load);

//create group
router.post('/create', group.create);

//udpate group
router.put('/:id', group.check_admin, group.update);

//update member
 router.put('/add_member/:id', group.check_admin, group.add_member);
 
//update member
 router.put('/update_member/:id', group.check_admin, group.update_member);

//remove member
 router.delete('/remove_member/:id', group.check_admin, group.remove_member);

//get group
  router.get('/:id', group.get);

//delete group
  router.delete('/:id', group.check_admin, group.remove);

//get group
  router.get('/specific_member/:id', group.get_by_member);

//bulk accept friend
// router.put('/bulk_accept/:user_id', friends.bulk_accept);

//get group
// router.get('/get/:user_id', friends.get);

//remove group
// router.delete('/remove/:user_id', friends.remove);
module.exports = router;
