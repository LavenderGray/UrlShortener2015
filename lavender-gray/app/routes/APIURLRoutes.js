var express = require('express');
var request = require('request');
var crypto = require('crypto');
var monitor = require('ping-monitor');


var REDIRECT_ID_SIZE = 5;

module.exports = (function() {

  var redirect = require('../models/Redirect');

  var app = express.Router();
  var http = require('http').Server(app),
      io = require('socket.io')(http);
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

  function createRedirection(url, ret) {
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
              id: key
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
    }
  }
  app.post('/redirect', function(req, res) {
    var url = getVariable(req, 'url');
    //startMonitoring(req);
    createRedirection(url, res);
  });


  io.on('connect',function(socket,req){
    socket.emit ('connection');

    var url = getVariable(req, 'url');


    var myWebsite = new monitor({
      website: url,
      interval: 15

    });

    var lastUpStatus;

    myWebsite.on('error', function (msg) {
      console.log(msg);
    });

    myWebsite.on('up', function (res) {
      console.log('UP: ' + res.website);
      lastUpStatus = new Date();
      console.log(lastUpStatus);
      socket.emit("infoMonitor", "<200 url alcanzable>")
      saveBDD(true);
    });

    myWebsite.on('down', function (res) {
      saveBDD(false);
      socket.emit("infoMonitor", "<404 url no alcanzable> Check Status: " +
                  'DOWN: ' + res.website + ' \n STATUS: ' + res.statusMessage)
      console.log('DOWN: ' + res.website + ' \n STATUS: ' + res.statusMessage);
    });

    // this event is required to be handled in all Node-Monitor instances
    myWebsite.on('error', function (res) {
      saveBDD(false);
      socket.emit("infoMonitor", "<404 url no alcanzable> Check Status: " +
          'DOWN: ' + res.website + ' \n STATUS: ' + res.statusMessage)
      console.log('ERROR occured trying to load ' + res.website);
      myWebsite.stop();
    });

    myWebsite.on('stop', function (website) {
      console.log(website + ' monitor has stopped.');
    });
  })

  function saveBDD(bool) {
    redirect.findOne({
      url: url
    }).exec({}, function (err2, red) {
          red.available = bool,
          red.latest_status = new Date();
      red.save();
    })
  }

  return app
})();
