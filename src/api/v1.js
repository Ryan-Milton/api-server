'use strict';

const express = require('express');

const auth = require('../auth/middleware.js');
const models = require('../middleware/model-finder.js');

const router = express.Router();

let sendJSON = (data,response) => {
  response.statusCode = 200;
  response.statusMessage = 'OK';
  response.setHeader('Content-Type', 'application/json');
  response.write( JSON.stringify(data) );
  response.end();
};

router.param('model', models.finder);

router.get('/api/v1/models', (req, res) => {
  let list = models.list();
  sendJSON(list, res);
});

router.get('/api/v1/:model/schema', (request, response) => {
  console.log('Model', request.model);
  sendJSON(request.model.jsonSchema(), response);
});

router.get('/api/v1/:model', (request,response,next) => {
  request.model.find()
    .then( data => {
      const output = {
        count: data.length,
        results: data,
      };
      sendJSON(output, response);
    })
    .catch( next );
});

router.get('/api/v1/:model/:id', (request,response,next) => {
  request.model.find({_id:request.params.id})
    .then( result => sendJSON(result[0], response) )
    .catch( next );
});

router.post('/api/v1/:model', auth('create'), (request,response,next) => {
  request.model.save(request.body)
    .then( result => sendJSON(result, response) )
    .catch( next );
});

router.put('/api/v1/:model/:id', auth('update'), (request,response,next) => {
  request.model.put(request.params.id, request.body)
    .then( result => sendJSON(result, response) )
    .catch( next );
});

router.patch('/api/v1/:model/:id', auth('update'), (request,response,next) => {
  request.model.patch(request.params.id, request.body)
    .then( result => sendJSON(result, response) )
    .catch( next );
});

router.delete('/api/v1/:model/:id', auth('delete'), (request,response,next) => {
  request.model.delete(request.params.id)
    .then( result => sendJSON(result, response) )
    .catch( next );
});

module.exports = router;