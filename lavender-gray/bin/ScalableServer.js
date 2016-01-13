// modules =================================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
http.post = require('http-post');

var path = require("path");


// config files ============================================

// configuration ===========================================

// Mongo conection =========================================
 var db = require('../config/db');
 mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({
  extended: true
})); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/../public'));

// routes ==================================================

app.all('*',function(req,res){
  var serv=process.env.Base;
  if ((req.url.split('?')[0]=="/API/statistics"
                    &&req.method=="GET")) {
                      serv=process.env.Statistics;

  }else if(req.url.split('?')[0]=="/API/redirect"){
    serv=process.env.Base;
  }else if((req.url.split('?')[0]=="/API/qr")){
              serv=process.env.QR;
  }else{
    res.sendfile(path.join(__dirname+'/../public/index.html'));
    return;
  }

  var hm=req.headers;
  if (req.method=="POST") {
    http.post(
      {
        host: serv.split(":")[0],
        port: serv.split(":")[1],
        path: req.url,
        headers: req.headers,
    },req.body
    ,function (resP) {
      if (resP.statusCode==200) {
        resP.pipe(res);
      }else{
        res.status(resP.statusCode).end();
      }
    }).end();
  }else{
    http.request(
      {
        host: serv.split(":")[0],
        port: serv.split(":")[1],
        path: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        param: req.param
    },function (resP,err) {
      if (resP.statusCode==200) {
        resP.pipe(res);
      }else{
        res.status(resP.statusCode).end();
      }
    }).end();
  }


});


// start app ===============================================
var port = process.env.PORT || 8080; // set our port
app.listen(port);
console.log('Magic happens on port ' + port); // shoutout to the user
exports = module.exports = app; // expose app
