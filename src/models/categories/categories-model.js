'use strict';

const Model = require('../model.js');
const schema = require('./categories-schema.js');

class Categories extends Model {}

const categories = new Categories(schema);

module.exports = categories;