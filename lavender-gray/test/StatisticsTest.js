var app = require("../server"),
  redirect = require("../app/models/Redirect");

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require("assert");

chai.use(chaiHttp);

var URLTest = "http://google.es";
var idTest = "x0x";
var backup = undefined;
var id;

describe("Statistics test", function() {
  before(function(done) {
      redirect.findOne({ //Remove urlShort with the test url and backup
        url: URLTest
      }, function(err, res) {
        if (!err && res != undefined) {
          backup = JSON.parse(JSON.stringify(res));
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
            assert.equal(data.err, 0);
            assert.equal(data.statistics.count, 0);
            assert.equal(data.statistics.url, URLTest);
            done();
          });
      }
    ),
    it("Test visits",
      function(done) {
        chai.request(app)
          .get('/' + idTest)   // Visit
          .end(function(errU, resU) {
            chai.request(app)
              .get('/' + idTest + "+")
              .send({
                'format': 'JSON'
              })
              .end(function(err, res) { // Check statistics
                res.should.have.status(200);

                var data = res.body;
                assert.equal(data.err, 0);
                assert.equal(data.statistics.count, 1);
                assert.equal(data.statistics.url, URLTest);
                done();
              })
          })
      }), after(function(done) {
      redirect.findOne({ //Restore backup
        url: URLTest
      }, function(err, res) {
        res.remove();
        if (backup) {
          new redirect(backup).save();
        }

        done();
      });
    })
});
