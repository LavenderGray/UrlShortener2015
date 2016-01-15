var app = require("../server"),
  redirect = require("../app/models/Redirect");

var io = require('socket.io-client');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require("assert");

chai.use(chaiHttp);

var urlWrong = "http://aasdas.kiii";
var urlCorrect = "http://google.com";
var backup = undefined;
var id;

var options = {traansports:['websocket'],'force new connection': true};

describe("Check URL", function() {
  before(function(done) {
      this.timeout(30000);

      redirect.findOne({ //Remove urlShort with the test url and backup
        url: urlCorrect
      }, function(err, res) {
        if (!err && res != undefined) {
          backup = JSON.parse(JSON.stringify(res));
          res.remove();
        }
        done();
      });
    }),
    it("Detec wrong url",
      function(done) {
        chai.request(app)
          .post('/API/redirect')
          .send({
            'url': urlWrong
          })
          .end(function(err, res) {
            res.should.have.status(400);
            done();
          });
      }
    ),
    it("Detec correct url",
      function(done) {
        chai.request(app)
          .post('/API/redirect')
          .send({
            'url': urlCorrect
          })
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      }
    ),
      it('Open websocket', function(done){
      this.timeout(20000);
      //Connect to server
      var client = io.connect("http://localhost:8080", options);
      var i = 0;
      client.on('connect', function(msg){
          console.log(msg);
          i++;
          if (i == 1) done();
      });
  }), after(function(done) {
      redirect.findOne({ //Restore backup
        url: urlCorrect
      }, function(err, res) {
        res.remove();
        if (backup) {
          new redirect(backup).save();
        }

        done();
      });
    })
});
