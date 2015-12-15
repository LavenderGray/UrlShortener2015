// modules =================================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


// config files ============================================

// configuration ===========================================

// Mongo conection =========================================
 var db = require('./config/db');
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
app.use(express.static(__dirname + '/public'));

// routes ==================================================
var apiRouteURL=require('./app/routes/APIURLRoutes'); // pass our application into our routes
var apiRouteStadist=require('./app/routes/APIStatisticsRoutes'); // pass our application into our routes
var mainRoute=require('./app/routes/mainRoutes'); // pass our application into our routes
app.use('/API',apiRouteURL);
app.use('/',apiRouteStadist);
app.use('/',mainRoute);

// start app ===============================================
var port = process.env.PORT || 8080; // set our port
app.listen(port);
console.log('Magic happens on port ' + port); // shoutout to the user
exports = module.exports = app; // expose app
