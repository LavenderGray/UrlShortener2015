var app = require("../server"),
  redirect = require("../app/models/Redirect");

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require("assert");

chai.use(chaiHttp);

var URLTest = "http://google.es";
var idTest = "x0x";
var id;

describe("Statistics test", function() {
  before(function(done) {
      redirect.findOne({ //Remove urlShort with the test url and backup
        url: URLTest
      }, function(err, res) {
        if (!err && res != undefined) {
          res.remove();
        }
        redirect.findOne({ //Remove urlShort with the test id(Incorrect id)
          id: idTest
        }, function(err, res2) {
          if (!err && res != undefined) {
            res.remove();
          }
          new redirect({
            id: idTest,
            url: URLTest
          }).save();
        });


        done();
      });
    }),
    it("Test Statistics",
      function(done) {
        chai.request(app)
          .get('/' + idTest + "+")
          .send({
            'format': 'JSON'
          })
          .end(function(err, res) {
            res.should.have.status(200);

            var data = res.body;
            assert.equal(data.count, 0);
            assert.equal(data.url, URLTest);
            done();
          });
      }
    ),
    it("Test visits",
      function(done) {
        chai.request(app)
          .get('/API/redirect') // Visit
          .send({
            'id': idTest
          })
          .end(function(errU, resU) {

            chai.request(app)
              .get('/' + idTest + "+")
              .send({
                'format': 'JSON'
              })
              .end(function(err, res) { // Check statistics
                res.should.have.status(200);
                var data = res.body;
                assert.equal(data.count, 1);
                assert.equal(data.url, URLTest);
                done();
              });
          });
      }),
    it("Test visits patrons",
      function(done) {
        var test = function(patron, count, end) {
          chai.request(app)
            .get('/' + idTest + "+" + patron)
            .send({
              'format': 'JSON'
            })
            .end(function(err, res) { // Check statistics
              res.should.have.status(200);
              var data = res.body;
              assert.equal(data.count, count);
              assert.equal(data.url, URLTest);
              end();
            });
        };
        test("date:~-~", 1, function() {
          test("date:~:1-1-1999", 0, function() {
            test("country:Unknow", 1, function() {
              test("country:ES", 0, function() {
                done();
              })
            })
          })
        });
      }),
    after(function(done) {
      redirect.findOne({ //Restore backup
        url: URLTest
      }, function(err, res) {
        res.remove();
        done();
      });
    })
});
