'use strict';

const Model = require('../model.js');
const schema = require('./products-schema.js');

class Products extends Model {}

const products = new Products(schema);

module.exports = products;