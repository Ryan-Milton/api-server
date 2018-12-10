'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Role = require('./roles-model.js');
const auth = require('./middleware.js');
const oauth = require('./lib/oauth.js');

// These routes should support a redirect instead of just spitting out the token ...
authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/roles', (req, res, next) => {
  let role = new Role(req.body);
  role.save()
    .then(result => res.send(result))
    .catch(next);
});

authRouter.get('/oauth', async (req, res, next) => {
  try {
    let token = await oauth.authorize(req);
    res.set('token', token);
    res.cookie('auth', token);
    res.send(token);
    // res.redirect(process.env.CLIENT_URL);
  }
  catch(e) { next(e); }
});

module.exports = authRouter;