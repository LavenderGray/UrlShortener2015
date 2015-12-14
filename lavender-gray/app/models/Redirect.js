// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Redirect', {
  id: {
    type: String,
    index: { unique: true }
  },url: {
    type: String,
    index: { unique: true }
  },ip: {
    type: String
  },created: {
    type: Date,
    default: new Date()
  }
});
