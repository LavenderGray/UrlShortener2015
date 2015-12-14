var express = require('express');
var path = require("path");


module.exports = (function() {
  var app = express.Router();


  var index = function(req, res) {
    res.sendfile(path.join(__dirname+'/../../public/index.html'));
  }

  app.all('*', index);

  return app
})();
