var app = require("../server"),
  redirect = require("../app/models/Redirect");

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require("assert");

chai.use(chaiHttp);

describe("Index test", function() {
  it("Index respond 200 code",
    function(done) {

      chai.request(app)
        .get('/')
        .end(function(err, res) {
          res.should.have.status(200);
          done();
        });
    }
  )
});

var URLTest = "http://google.es";
var idTest = "x0x";

var backup = undefined;
var id;

describe("Redirect test", function() {
  before(function(done) {

      redirect.findOne({ //Remove urlShort with the test url and backup
        url: URLTest
      }, function(err, res) {
        if (!err && res != undefined) {
          backup = JSON.parse(JSON.stringify(res));
          res.remove();
        }
        done();
      });
    }),
    it("Create new shortURL",
      function(done) {

        chai.request(app)
          .post('/API/redirect')
          .send({
            'url': URLTest
          })
          .end(function(err, res) {
            res.should.have.status(200);
            var data = res.body;
            id = data.redirect.id;
            assert.equal(data.create, true);
            done();
          });
      }
    ),
    it("Try to create exist shortURL",
      function(done) {
        chai.request(app)
          .post('/API/redirect')
          .send({
            'url': URLTest
          })
          .end(function(err, res) {
            res.should.have.status(200);
            var data = res.body;
            assert.equal(data.create, false);
            done();
          });
      }
    ),
    it("Use shortURL",
      function(done) {
        chai.request(app)
          .get('/API/redirect')
          .send({
            'id': id
          })
          .end(function(err, res) {
            res.should.have.status(200);
            var data = res.body;
            assert.equal(data.redirect.url, URLTest);
            done();
          });
      }
    ),it("Use wrong shortURL",
      function(done) {
        chai.request(app)
          .get('/API/redirect')
          .send({
            'id': idTest
          })
          .end(function(err, res) {
            res.should.have.status(404);
            done();
          });
      }
    ), after(function(done) {
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
