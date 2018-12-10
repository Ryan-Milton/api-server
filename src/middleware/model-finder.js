'use strict';

const requireDirectory = require('require-directory');

const whitelist = /.*?model.js$/; // Only index *model.js files
const renamer = (name) => name.replace(/(.*?-)model/g, 'model'); // make them all named "model"
const models = requireDirectory(module, '../models', {rename:renamer, include: whitelist});

/*
models object:
{
  notes: { model: Notes { ... } },
}
 */

const list = () => Object.keys(models).filter((model) => model !== "model" );

const finder = (req,res,next) => {
  
  let model = req.params.model;
  try {
    req.model = models[model].model;
    next();
  }
  catch(e) { next('Invalid Model'); }
  
};

module.exports = { finder, list };