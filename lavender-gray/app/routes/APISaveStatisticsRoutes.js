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

  function getRedirection(id, ret) {
    if (id != undefined) {
      redirect.findOne({
        id: id
      }).exec({}, function(err, red) {
        if (!err && red != undefined) {
          ret({
            err: 0,
            redirect: red
          });
        } else {
          ret({
            err: 1
          });
        }
      });
    } else {
      ret({
        err: 2
      });
    }
  }

  /*
   * GET /API/redirect
   * id: id of redirection
   *
   * LOGGER THE VISIT
   */
  function getIP(req) {
    return (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || req.client.remoteAddress);
  }

  function visit_red(r, req) {
    if (r.err == 0) {
      red = r.redirection;
      var ua = useragent.parse(req.headers['user-agent']);
      var browser = ua.browser;
      var platform = ua.platform;
      var ip = getIP(req);
      location = geoip.lookup(ip);
      var country = "Unknow";
      if (location != null) {
        country = location.country;
      }
      var nvisit = new visit({
        redirect: r.redirect,
        ip: ip,
        platform: platform,
        country: country,
        browser: browser
      });
      nvisit.save();
    }
  }
  app.get('/redirect', function(req, res, next) {
    var id = getVariable(req, 'id');
    getRedirection(id, function(r) {
      //res.json(r);
      visit_red(r, req);
    });
    next();
  });

  return app
})();
