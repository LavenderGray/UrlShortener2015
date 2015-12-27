var express = require('express');
var mongoose = require('mongoose');
var request = require("request");

module.exports = (function() {

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

  /*
   * POST /redirect
   * url: url of redirect
   * return
   *       400: Is not a valid URL
   */
  function urlCorrect(s) {
    var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }
  app.post('/redirect', function(req, res, next) {
    var url = getVariable(req, 'url');
    if (!urlCorrect(url)) {
      res.status(400).end();
    } else {
      request(url, function(error, response, body) {
        if (error) {
          res.status(400).end();
        } else {
          next();
        }
      });
    }

  });

  return app
})();
