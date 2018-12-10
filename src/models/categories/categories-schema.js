'use strict';

const mongoose = require('mongoose');
require('mongoose-schema-jsonschema')(mongoose);

const categories = mongoose.Schema({
  name: {type:String, require:true},
},{ toObject:{virtuals:true}, toJSON:{virtuals:true} });

categories.virtual('products', {
  ref: 'products',
  localField: 'name',
  foreignField: 'category',
  justOne:false,
});

categories.pre('find', function() {
  try {
    this.populate('products');
  }
  catch(e) {
    console.error('ERR', e);
  }
});

module.exports = mongoose.model('categories', categories);