const express = require('express');
var friends  = require('../controllers/friend');
const router = express.Router();;

// router.get('/signup', User.load);

//add friend
router.post('/add', friends.create);

//bulk add friend
router.post('/bulk_add', friends.bulk_create);

//accept friend
router.put('/accept/:user_id', friends.accept);

//bulk accept friend
router.put('/bulk_accept/:user_id', friends.bulk_accept);

//get friends
router.get('/get/:user_id', friends.get);

//remove friends
router.delete('/remove/:user_id', friends.remove);
module.exports = router;
