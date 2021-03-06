var express = require('express'),
  qr = require('./qrHelper/fancyqr.js'),
  fs = require('fs'),
  vCard = require('vcards-js'),
  urlencode = require('urlencode'),
  config = require('../../config/conf'),
  request = require('request');
module.exports = (function() {
  var app = express.Router();

  app.post('/qr', function(req, res) {
    if (req.body.url == undefined) {
      res.sendStatus(400);
      return 0;
    }
    request({
      url: "http://" + req.headers.host + '/API/redirect', //URL to hit
      method: 'post', //Specify the method

      json: {
        url: req.body.url
      }
    }, function(error, response, body) {
      if (error || body == undefined || body.redirect == undefined) {
        res.status(400).end();
        return;
      }
      //console.log(body.redirect.id);
      //console.log(body.token);
      //token = body.token;

      var json = "lol";
      var urlShortComplete = req.headers.host + body.redirect.id;
      //var vcard = createVcard(req, urlShortComplete);
      //console.log(vcard);
      createQrLocal(getVcard(req, urlShortComplete), json, req, res);
    });




  })

  function getVcard(req, urlShortComplete) {
    r = "BEGIN:VCARD\nVERSION:3.0\n";

    if (req.body.nombre != undefined && req.body.nombre != "") {
      r += "N:" + req.body.nombre + "\n"
    }
    if (req.body.apellidos != undefined && req.body.nombre != "") {
      r += "FN:" + req.body.apellidos + "\n"
    }

    r += "URL;TYPE=INTERNET:" + urlShortComplete + "\nEND:VCARD"
    return r;
  }

  function createVcard(req, urlShortComplete) {
    //Create vCard
    vcard = vCard();
    //Json to VCard
    if (req.body.nombre != undefined) vcard.firstName = req.body.nombre;
    if (req.body.apellidos != undefined) vcard.lastName = req.body.apellidos;

    vcard.url = urlShortComplete;

    return vcard;
  }


  function createQrLocal(add, json, req, res) {


    //Our Qr local library only accept minium, medium high and max level or error
    var errLevel = {
      "min": "minium",
      "med": "medium",
      "hig": "high",
      "max": "max"
    };
    var opt = {};
    //Create options for qr.save
    if (req.body.rgb != undefined) {
      var rgb = req.body.rgb.split(" ");
      console.log(rgb);
      opt.r = rgb[0];
      opt.g = rgb[1];
      opt.b = rgb[2];
    }


    if (req.body.err != undefined) opt.err = errLevel[req.body.err];
    var hap = "";
    fs.exists('./public/pngs/pelli.png', function(exists) {
      if (!exists) {
        hap = ".";
      }

      var img = fs.readFileSync(hap + './public/pngs/pelli.png');
      console.log(img);
      opt.logoPath = new Buffer(img);

      qr.save(add, opt, function(err, buf) {
        console.log(err);
        if (err) res.sendStatus(400);
        else {
          json.qr = buf;
          //buf.pipe(require('fs').createWriteStream('public/pngs/i_love_qr.png'));

          fs.writeFile(hap + './public/pngs/temp.png', buf, function(err) {
            if (err) {
              console.log("err");
            }
          });
          res.status(200).send(hap + "./pngs/temp.png")
        }
      });
    });
  }
  return app
})();
