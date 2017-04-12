const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config.js');
const routes = require('./app/routes');
const port = process.env.PORT || 3000;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',parameterLimit: 100000, extended: true}));
// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB
mongoose.connect(config.database)
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

//Routings
routes(app);

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
