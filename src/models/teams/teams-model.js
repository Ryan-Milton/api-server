'use strict';

const Model = require('../model.js');
const schema = require('./teams-schema.js');

class Teams extends Model {}

const teams = new Teams(schema);

module.exports = teams;