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
  function getStatistics(red, ret, extraMatch) {
    var lastMonth = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    var match={};
    if (extraMatch!=undefined) {
      extraMatch["redirect"]=red._id;
      match=extraMatch;
    }else{
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
        ret({err: 1});
        return;
      }
      var est={count: 0,
      url: red.url,
      created: red.created};
      for (var i = 0; i < res.length; i++) {
        for (var o = 0; o < others.length; o++) {
          var dat = res[i]._id;
          if(est[others[o].id]==undefined){
            est[others[o].id]={};
          }
          if(est[others[o].id][dat[others[o].id]]==undefined){
            est[others[o].id][dat[others[o].id]]=0;
          }
          est[others[o].id][dat[others[o].id]]+=res[i].count;
        }
        est["count"]+=res[i].count;
      }

      // Hide ip
      var arr=[];
      for(var key in est["ip"]){
        arr.push(est["ip"][key]);
      }
      est["ip"]=arr;
      ret(est);
      console.log(est);
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
            if (res.err == 1) {
              res.status(404).end();
            } else {
              res.json(sta);
            }
          });

        } else if (res.err == 1) {
          res.status(404).end();
        } else if (res.err == 2) {
          res.status(400).end();
        }
      })
    } else {
      res.status(400).end();
    }
  });


  app.get('API/statistics', function(req, res, next) {
    var extraMatch={};
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

        } else if (res.err == 1) {
          res.status(404).end();
        } else if (res.err == 2) {
          res.status(400).end();
        }
      })
    } else {
      res.status(400).end();
    }
  });

  return app
})();
