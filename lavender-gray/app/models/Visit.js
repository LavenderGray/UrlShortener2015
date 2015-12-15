// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Visit', {
  redirect: {
    type: Schema.ObjectId,
    ref: 'Redirect'
  },ip: {
    type: String
  },date: {
    type: Date,
    default: new Date()
  },platform: {
    type: String
  },country: {
    type: String
  },browser: {
    type: String
  }
});
