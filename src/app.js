'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const https = require('https');
const fs = require('fs');
const path = require('path');

const errorHandler = require('./middleware/error.js');
const notFound = require('./middleware/404.js');
const apiRouter = require('./api/v1.js');
const authRouter = require('./auth/router.js');
const auth = require('./auth/middleware.js');

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(authRouter);
app.use(apiRouter);

app.get('/', auth(), (req, res) => {
  res.send('hi');
});

app.get('/s', auth('create'), (req, res) => {
  res.send('hi');
});

app.get('/d', auth('delete'), (req, res) => {
  res.send('hi');
});

app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  startSSL: () => {
    let certOptions = {
      key: fs.readFileSync(path.resolve('./server.key')),
      cert: fs.readFileSync(path.resolve('./server.cert')),
    };
    var server = https.createServer(certOptions, app).listen(443);
  },
  start: (port) => {
    if(!isRunning) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server up on ${port}`);
      });
    }
    else {
      console.log(`Server is already running`)
    }
  },
};