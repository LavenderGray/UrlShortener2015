var express = require('express');
var mongoose = require('mongoose');
var request = require("request");
var monitor = require('ping-monitor');

module.exports = (function() {

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
     * POST /redirect
     * url: url of redirect
     * return
     *       400: Is not a valid URL
     */
    function urlCorrect(s) {
        var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
    }

    app.post('/redirect', function(req, res, next) {
        var url = getVariable(req, 'url');
        if (!urlCorrect(url)) {
            res.status(400).end();
        } else {
            request(url, function(error, response, body) {
                if (error) {
                    res.status(400).end();
                } else {
                    startMonitoring(req);
                    next();
                }
            });
        }
    })

    function startMonitoring(req) {
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
        });

        myWebsite.on('down', function (res) {
            console.log('DOWN: ' + res.website + ' \n STATUS: ' + res.statusMessage);
        });

        // this event is required to be handled in all Node-Monitor instances
        myWebsite.on('error', function (res) {
            console.log('ERROR occured trying to load ' + res.website);
            myWebsite.stop();
        });

        myWebsite.on('stop', function (website) {
            console.log(website + ' monitor has stopped.');
        });
    }

    return app
})();
