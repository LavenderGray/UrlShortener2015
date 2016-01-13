var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var useragent = require('express-useragent');
var geoip = require('geoip-lite');

module.exports = (function() {

  var visit = require('../models/Visit');
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

  /*
   * GET /:id+
   * id: id of redirection
   * format: format the statistics OPTIONAL(default HTML format)
   *    'HTML': to print de statistics in HTML format
   *    'JSON': to print de statistics in JSON format
   * return
   *       {statistics}: all ok
   *       404: no exist redirection
   *       400: wrong format
   */
  function statistics(req, res, next) {
    var format = getVariable(req, 'format');
    if (format == undefined || format == 'HTML') {
      return next();
    } else if (format == 'JSON') {
      var id = getVariable(req, 'id');
      var data = getVariable(req, 'data');
      var r="?id="+id+"&data="+data;
      res.writeHead(301, {
        Location: '/API/statistics'+r
      });
      res.end();
    } else {
      res.status(400).end();
    }
  }

  app.get('/:id\\+:data', function(req, res, next) {
    statistics(req, res, next);
  });
  app.get('/:id\\+', function(req, res, next) {
    statistics(req, res, next);
  });

  return app
})();
