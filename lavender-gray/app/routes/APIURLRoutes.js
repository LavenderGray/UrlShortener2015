var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var crypto = require('crypto');

var configuration = require('../../configuration');
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
   *       {err: 0,redirect}: all ok
   *       {err: 1}: no exist redirection
   *       {err: 2}: wrong format
   */
  function getRedirection(id, ret) {
    if (id != undefined) {
      redirect.findOne({
        id: id
      }).exec({}, function(err, red) {
        console.log(red);
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
  app.get('/redirect', function(req, res) {
    var id = getVariable(req, 'id');

    getRedirection(id, function(r) {
      res.json(r)
    });
  });

  /*
   * PUT /redirect
   * url: url of redirect
   * return
   *       {err: 0,redirect}: all ok
   *       {err: 1}: not perms
   *       {err: 2}: wrong data
   *       {err: 3}: already exist
   */
  function urlCorrect(s) {
    var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }
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

  function createRedirection(url, ret) {
    if (url != undefined) {
      if(!urlCorrect(url)){
        ret({err: 2});
        return;
      }
      redirect.findOne({
        url: url
      }).exec({}, function(err2, red) {
        if (red != undefined) {
          ret({
            err: 3,
            redirect: red
          });
        } else {
          generateUniqueId(function(key) {
            var nred = new redirect({
              url: url,
              id: key
            });
            nred.save();
            ret({
              err: 0,
              redirect: nred
            });
          });
        }
      });

    } else {
      ret({
        err: 2
      });
    }
  }
  app.put('/redirect', function(req, res) {
    var url = getVariable(req, 'url');
    createRedirection(url, function(r) {
      res.json(r);
    });
  });

  return app
})();
