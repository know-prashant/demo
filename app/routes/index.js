var express = require('express');

module.exports = (app) => {
  app.use('/static/images', express.static(__dirname + '/uploads'));

  app.get('/', (req, res) => {
    res.json({ message: 'hello index!'});
  });

  app.use('/api/user', require('./user')); //api
  app.use('/api/friend', require('./friend')); //api
  app.use('/api/group', require('./group')); //api

};
