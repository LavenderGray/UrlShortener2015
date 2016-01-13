var express = require('express'),
    qr = require('./qrHelper/fancyqr.js'),
    fs = require('fs'),
    vCard = require('vcards-js'),
    urlencode = require('urlencode'),
    request = require('request');
module.exports = (function() {
    var app = express.Router();

    app.post('/qr', function(req,res){
        if (req.body.url == undefined) {
            res.sendStatus(400);
            return 0;
        }
        request({
            url: 'http://localhost:8080/API/redirect', //URL to hit
            method: 'post', //Specify the method

            json: {
                url: req.body.url            }
        }, function(error, response, body){
            console.log(body.redirect.id);
            //console.log(body.token);
            //token = body.token;
             var json = "lol";

            var urlShortComplete = "http://localhost:8080/" + body.redirect.id;
            var vcard = createVcard(req, urlShortComplete);
            console.log(vcard);
            createQrLocal(vcard.getFormattedString(), json, req, res);
        });




    })

    function createVcard(req, urlShortComplete){
        //Create vCard
        vcard = vCard();
        //Json to VCard
        if (req.body.firstName != undefined) vcard.firstName = req.body.firstName;
        if (req.body.lastName != undefined) vcard.lastName = req.body.lastName;
        if (req.body.organization != undefined) vcard.organization = req.body.organization;
        if (req.body.photo != undefined) vcard.photo.attachFromUrl(req.body.photo);
        if (req.body.workPhone != undefined) vcard.workPhone = req.body.workPhone;
        if (req.body.birthday != undefined) vcard.birthday = req.body.birthday;
        if (req.body.title != undefined) vcard.title = req.body.title;
        vcard.firstName = "Ruben";
        vcard.lastName = "Gabas";


        return vcard;
    }


    function createQrLocal(add, json, req, res) {
        //Our Qr local library only accept minium, medium high and max level or error
        var errLevel = {"L": "minium", "M": "medium", "Q": "high", "H": "max"};
        var opt = {};
        //Create options for qr.save
        if (req.body.color != undefined) {
            if (req.body.color.r != undefined) opt.r = req.body.color.r;
            if (req.body.color.g != undefined) opt.g = req.body.color.g;
            if (req.body.color.b != undefined) opt.b = req.body.color.b;
        }
        if (req.body.errLevel != undefined) opt.err = errLevel[req.body.errLevel];
        if (req.body.logo != undefined) opt.logo = new Buffer(req.body.logo);

        qr.save(add, opt, function (err, buf) {
            if (err) res.sendStatus(400);
            else {
                json.qr = buf;
                //buf.pipe(require('fs').createWriteStream('public/pngs/i_love_qr.png'));

                fs.writeFile('public/pngs/temp.png', buf, function(err){
                  if(err) {
                      console.log("err");
                  }
                });
                res.status(200).send("../../pngs/temp.png")
            }
        });
    }
    return app
})();
