'use strict';

const Model = require('../model.js');
const schema = require('./players-schema.js');

class Players extends Model {}

const players = new Players(schema);

module.exports = players;