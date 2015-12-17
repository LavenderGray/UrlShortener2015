var app = require("../server"),
  redirect = require("../app/models/Redirect");

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require("assert");

chai.use(chaiHttp);

var URLTest = "http://aasdas.kiii";

describe("Check URL", function() {
  it("Detec wrong url",
    function(done) {
      chai.request(app)
        .get('/API/redirect')
        .send({
          'url': URLTest
        })
        .end(function(err, res) {
          res.should.have.status(200);
          var data = res.body;
          assert.equal(data.err, 2);
          done();
        });
    }
  )
});
