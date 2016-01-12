var express = require('express');
var request = require('request');
var crypto = require('crypto');

var REDIRECT_ID_SIZE = 5;

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

  /*
   * GET /redirect
   * id: id of redirection
   * return
   *       {redirect}: all ok
   *       404: no exist redirection
   *       400: wrong format
   */
  function getRedirection(id, ret) {
    if (id != undefined) {
      redirect.findOne({
        id: id
      }).exec({}, function(err, red) {
        if (!err && red != undefined) {
          ret.json({
            redirect: red
          });
        } else {
          ret.status(404).end();
          /*ret.json({
            err: 1
          });*/
        }
      });
    } else {
      ret.status(400).end();
      /*ret.json({
        err: 2
      });*/
    }
  }
  app.get('/redirect', function(req, res) {
    var id = getVariable(req, 'id');
    getRedirection(id, res);
  });

  /*
   * POST /redirect
   * url: url of redirect
   * return
   *       {create: true,redirect}: all ok
   *       {create: false}: already exist
   *       400: wrong data
   */
  function randomSecret(n) {
    return crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);
  }
  function generateUniqueId(ret) {
    var rand = randomSecret(REDIRECT_ID_SIZE).replace(',', '');
    redirect.findOne({
      id: rand
    }).exec({}, function(err2, red) {
      if (red == undefined) {
        ret(rand);
      } else {
        generateUniqueId(ret);
      }
    });
  }
  function getIP(req) {
    return (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || req.client.remoteAddress);
  }
  function createRedirection(req, url, ret) {
    if (url != undefined) {
      redirect.findOne({
        url: url
      }).exec({}, function(err2, red) {
        if (red != undefined) {
          ret.json({
            create: false,
            redirect: red
          });
        } else {
          generateUniqueId(function(key) {
            var nred = new redirect({
              url: url,
              id: key,
              creator: getIP(req)
            });
            nred.save();
            ret.json({
              create: true,
              redirect: nred
            });
          });
        }
      });

    } else {
      ret.status(400).end();
      /*ret({
        err: 2
      });*/
    }
  }
  app.post('/redirect', function(req, res) {
    var url = getVariable(req, 'url');
    createRedirection(req, url, res);
  });

  return app
})();
