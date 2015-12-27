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
   * GET /:id
   * id: id of redirection
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
  app.get('/:id', function(req, res, next) {
    var id = getVariable(req, 'id');
    if (id.charAt(id.length - 1) != "+") {
      getRedirection(id, function(r) {
        visit_red(r, req);
      });
    }
    next();
  });

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

  function getStatistics(red, ret) {
    var Schema = mongoose.Schema;

    visit.find({
      redirect: red
    }).exec({}, function(err, vis) {
      visit.find({
        redirect: red
      }).distinct('ip', function(err, vis2) {
        var res = {
          count: vis != undefined ? vis.length : 0,
          unique_visitors: vis2 != undefined ? vis2.length : 0,
          url: red.url,
          created: red.created
        };
        ret(res);
      });

    });
  }
  app.get('/:id\\+', function(req, res, next) {
    var id = getVariable(req, 'id');
    var format = getVariable(req, 'format');
    if (format == undefined || format == 'HTML') {
      return next();
    } else if (format == 'JSON') {
      getRedirection(id, function(red) {
        if (red.err == 0) {
          getStatistics(red.redirect, function(sta) {
            res.json(sta);
          });

        } else if(res.err == 1){
          res.status(404).end();
        } else if(res.err == 2){
          res.status(400).end();
        }
      })
    } else {
      res.status(400).end();
    }
  });

  return app
})();
