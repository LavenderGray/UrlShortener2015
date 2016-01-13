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
   * GET /API/statistics
   * id: id of redirection
   * return
   *       {statistics}: all ok
   *       404: no exist redirection
   *       400: wrong format
   */
  function getStatistics(red, ret, extraMatch) {
    var lastMonth = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    var match = {};
    if (extraMatch != undefined) {
      extraMatch["redirect"] = red._id;
      match = extraMatch;
    } else {
      match = {
        redirect: red._id
      };
    }
    var base = {
      id: "redirect",
      value: "$redirect"
    };
    var others = [base, {
      id: "platform",
      value: "$platform"
    }, {
      id: "country",
      value: "$country"
    }, {
      id: "browser",
      value: "$browser"
    }, {
      id: "ip",
      value: "$ip"
    }];
    var datas = {};
    datas[base.id] = base.value;

    for (var i = 1; i < others.length; i++) {
      datas[others[i].id] = others[i].value;
    }
    var q = [{
      $match: match
    }];
    q.push({
      $group: {
        _id: datas,
        count: {
          $sum: 1
        }
      }
    });

    var f = visit.aggregate(q);
    f.exec(function(err, res) {
      if (err) {
        ret({
          err: 1
        });
        return;
      }
      var est = {
        count: 0,
        url: red.url,
        created: red.created
      };
      for (var i = 0; i < res.length; i++) {
        for (var o = 0; o < others.length; o++) {
          var dat = res[i]._id;
          if (est[others[o].id] == undefined) {
            est[others[o].id] = {};
          }
          if (est[others[o].id][dat[others[o].id]] == undefined) {
            est[others[o].id][dat[others[o].id]] = 0;
          }
          est[others[o].id][dat[others[o].id]] += res[i].count;
        }
        est["count"] += res[i].count;
      }

      // Hide ip
      var arr = [];
      for (var key in est["ip"]) {
        arr.push(est["ip"][key]);
      }
      est["ip"] = arr;
      ret(est);
    });

  }

  function getTime(date) {
    if (date == "~") {
      return null;
    }
    return new Date(Date.parse(date));
  }

  function addData(ret, key, value) {
    if (ret[key] == undefined) {
      ret[key] = {
        "$in": []
      };
    }
    ret[key]["$in"].push(value);
  }

  function getDatas(data) {
    if (data == undefined) {
      return {};
    }
    var ret = {};
    var splts = data.split(';');
    for (var i = 0; i < splts.length; i++) {
      var string = splts[i];
      var split = string.split(':');

      if (split != undefined && split.length > 1) {

        switch (split[0]) {
          case "date":
            if (split.length > 2) {
              var rango = {
                "$gt": getTime(split[1]),
                "$lt": getTime(split[2])
              };

              ret.date = rango;
              //addData(ret,"date",rango);
            }
            break;
          case "platform":
            addData(ret, "platform", split[1]);
            break;
          case "browser":
            addData(ret, "browser", split[1]);
            break;
          case "country":
            addData(ret, "country", split[1]);
            break;
          default:
        }
      }
    }
    return ret;
  }

  app.get('/statistics', function(req, res, next) {
    var extraMatch = {};
    var id = getVariable(req, 'id');
    var data = getVariable(req, 'data');
    var datas = getDatas(data);
    getRedirection(id, function(red) {
      if (red.err == undefined || red.err == 0) {
        getStatistics(red.redirect, function(sta) {
          res.json(sta);
        }, datas);
      } else if (red.err == 1) {
        res.status(404).end();
      } else if (red.err == 2) {
        res.status(400).end();
      }
    })
  });

  return app
})();
