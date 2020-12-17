var assert = require('assert');
var request = require("request");
var expect  = require("chai").expect;
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
require("dotenv").config();

var url = process.env.APPLICATION_BASE_HOST;
const token = process.env.TOKEN;
const categories = ["teachers", "students", "community", "educationLeader", "infrastructure"];
const projects = ["5fc48186b016ad56ce6b4bfd"];
const templates = ["Test-2"];

describe('Project categories list', function () {
  it('Project categories list', function(done) {
    chai.request(url)
      .get('/improvement-project/api/v1/library/categories/list')
      .set('Authorization', 'Bearer ' + token)
      .set('X-authenticated-user-token', token)
      .end(function (err, res) {
        if(err) res.response(err);
        expect(res.statusCode).to.equal(200);
        done();
    
      });
  });

});

let category = categories[Math.floor(Math.random() * categories.length)];
describe('List of library projects', function () {
  it('List of library projects', function(done) {
    chai.request(url)
      .get('/improvement-project/api/v1/library/categories/projects/'+ category)
      .set('Authorization', 'Bearer ' + token)
      .set('X-authenticated-user-token', token)
      .end(function (err, res) {
        if(err) res.response(err);
        expect(res.statusCode).to.equal(200);
        done();
    
      });
  });

});

let project = projects[Math.floor(Math.random() * projects.length)];
describe('Library projects details', function () {
  it('Library projects details', function(done) {
    chai.request(url)
      .get('/improvement-project/api/v1/library/categories/projectDetails/' + project)
      .set('Authorization', 'Bearer ' + token)
      .set('X-authenticated-user-token', token)
      .end(function (err, res) {
        if(err) res.response(err);
        expect(res.statusCode).to.equal(200);
        done();
    
      });
  });

});

let template = templates[Math.floor(Math.random() * templates.length)];
describe('Import templates from existsing project templates', function () {
  it('Import templates from existsing project templates', function(done) {
    chai.request(url)
      .post('/improvement-project/api/v1/project/templates/importProjectTemplate/' + template)
      .set('Authorization', 'Bearer ' + token)
      .set('X-authenticated-user-token', token)
      .send({
        "data" : {
            "externalId" : "Test-Template1111",
            "isReusable" : false,
            "rating" : 5
        }

      })
      
      .end(function (err, res) {
        if(err) {
          res.response(err);
          done(err);
        }
        expect(res.statusCode).to.equal(200);
        done();
    
      });
  });

});


