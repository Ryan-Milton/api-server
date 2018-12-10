'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String},
  role: {type: String, required:true, default:'user', enum:['admin','editor','user'] },
}, { toObject:{virtuals:true}, toJSON:{virtuals:true} });

users.virtual('acl', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne:true,
});

users.pre('findOne', function() {
  try {
    this.populate('acl');
  }
  catch(e) {
    console.error('Find One Error', e);
  }
});

// users.pre('save', function(next) {
//   bcrypt.hash(this.password,10)
//     .then(hashedPassword => {
//       this.password = hashedPassword;
//       next();
//     })
//     .catch( error => {throw error;} );
// });

users.pre('save', function(next) {
  bcrypt.gentSalt(10, function(err, salt) {
    bcrypt.hash(this.password,salt)
      .then(hashedPassword => {
        this.password = hashedPassword;
        next();
      })
      .catch( error => {throw error;} );
  });
});

users.methods.can = function(capability) {
  return this.acl.capabilities.includes(capability);
};

users.statics.createFromOAuth = function(incoming) {

  if ( ! incoming || ! incoming.email ) {
    return Promise.reject('VALIDATION ERROR: missing username/email or password ');
  }

  return this.findOne({email:incoming.email})
    .then(user => {
      if ( ! user ) { throw new Error ('User Not Found'); }
      return user;
    })
    .catch( error => {
    // Create the user
      let username = incoming.email;
      let password = 'none';
      return this.create({
        username: username,
        password: password,
        email: incoming.email,
      });
    });

};

users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(console.error);
};

users.statics.authenticateToken = function(token) {
  let parsedToken = jwt.verify(token, process.env.SECRET || 'changeit');
  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => {
      return user;
    })
    .catch(error => error);
};

// Compare a plain text password against the hashed one we have saved
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

// Generate a JWT from the user id and a secret
users.methods.generateToken = function() {
  let tokenData = {
    id:this._id,
    capabilities: (this.acl && this.acl.capabilities) || [],
  };
  return jwt.sign(tokenData, process.env.SECRET || 'changeit' );
};

module.exports = mongoose.model('users', users);