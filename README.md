# Quorg Api

This is a chat application Api.

# Installing

```
npm install
npm install -g@latest  - to install latest
```

#Create a config.js in your root folder and add the following
```
module.exports = {
  'database': 'database name',
  'email' : {
    'service': 'emailservice ex:- gmail',
    'username': 'Email id',
    'password': 'Password',
    'from': '"Prashant Yadav" <john.doe@quorg.com>'
  },
  'otp_length': 4
};
```

Running the server

```
npm start
will run with nodemon -- nodemon monitor's live changes
Will run on Environment Port if found else will run on 3000. Configure the port in server.js
```

## Core Dependencies

* [Express](https://github.com/expressjs/express) - Nodejs Framework
* [MongoDB](https://www.mongodb.com/) - NoSql Database
* [Mongoose](https://github.com/Automattic/mongoose) - object modeling tool for MongoDB
* [Bcrypt-nodejs](https://github.com/shaneGirish/bcryptJS) - Password Hashing Function
