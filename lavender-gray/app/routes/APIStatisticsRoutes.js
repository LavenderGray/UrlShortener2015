var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

module.exports = (function() {

  var redirect = require('../models/Redirect');

  var app = express.Router();

  /*
   * Extra functions
   */
  function getVariable(req, name) {
    if (req.originalMethod == "POST") {
      return req.body[name];
    } else {
      return req.param(name);
    }
  }

  app.get('/redirect', function(req, res) {
    var id = getVariable(req, 'id');
    next();
  });


  return app
})();
