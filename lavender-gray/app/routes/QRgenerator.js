var express = require('express');
var mongoose = require('mongoose');
var request = require("request");
var querystring = require('querystring');
var http = require('request');
var fs = require('fs');
var qr = require('qr-image');
module.exports = (function() {
    var app = express.Router();

    app.post('/qr', function(req,res){
        console.log(req.body.url);

        var qr_svg = qr.image(req.body.url, { type: 'png' });
        qr_svg.pipe(require('fs').createWriteStream('public/pngs/i_love_qr.png'));
        console.log("OP");
        res.status(200).send("../../pngs/i_love_qr.png")
    })

    return app
})();
