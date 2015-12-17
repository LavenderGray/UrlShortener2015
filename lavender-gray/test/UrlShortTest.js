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
      this.timeout(30000);

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
var backup = undefined;
var id;

describe("Redirect test", function() {
  before(function(done) {
      this.timeout(30000);

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
          .put('/API/redirect')
          .send({
            'url': URLTest
          })
          .end(function(err, res) {
            res.should.have.status(200);


            var data = res.body;
            id = data.redirect.id;
            assert.equal(data.err, 0);
            done();
          });
      }
    ),
    it("Try to create exist shortURL",
      function(done) {
        chai.request(app)
          .put('/API/redirect')
          .send({
            'url': URLTest
          })
          .end(function(err, res) {
            res.should.have.status(200);
            var data = res.body;
            assert.equal(data.err, 1);
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
            assert.equal(data.err, 0);
            assert.equal(data.redirect.url, URLTest);
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
