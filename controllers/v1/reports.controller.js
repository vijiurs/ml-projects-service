var express = require('express');
var router = express.Router();


var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');

var reportServ = require('../../services/reports.service');
var winston = require('../../config/winston');


// routes
router.get('/reportsList', reportList);
router.get('/getObservationReport',getObservationReport);
router.get('/getMonthViseReport',getMonthViseReport);

router.get('/getDetailViewReport',getDetailViewReport);
router.get('/getMonthlyOrQuarterReportPdf',getMonthlyOrQuarterReportPdf);
router.get('/numberOfProjectsPerUser',numberOfProjectsPerUser);
router.get('/getFullMonthlyOrQuarterPdf',getFullMonthlyOrQuarterPdf);
router.post('/shareTaskPdf',shareTaskPdf);
// router.post('/check',check);


module.exports = router;
// module.exports = router;


function reportList(req, res) {
          try{
            reportServ.getReports(req, res)
            .then(function (result) {
              res.send(result);
            }).catch(e => console.log("e",e));
         
          }catch(err){
            console.log("errr",err);
            }
  }
  function getObservationReport(req, res) {
            try{
              reportServ.getObservationReport(req, res)
              .then(function (result) {
                res.send(result);
              }).catch(e => console.log("e",e));
           
            }catch(err){
              console.log("errr",err);
              }
    }

    function getMonthViseReport(req, res) {
      try{
        reportServ.getMonthViseReport(req, res)
        .then(function (result) {
          res.send(result);
        }).catch(e => {
          console.log("erorr while featching data",e);
          res.send(e);
        });
      }catch(err){
        console.log("errr",err);
        }
  }

function getDetailViewReport(req, res) {
    try{
      reportServ.getDetailViewReport(req, res)
      .then(function (result) {
        res.send(result);
      }).catch(e => {
        console.log("erorr while featching data",e);
        res.send(e);
      });
    }catch(err){
      console.log("errr",err);
      }
}



/**
 * getMonthlyOrQuarterReportPdf is used to generate the pdf file of monthwise and queaterly full report
 * @param {*} req 
 * @param {*} res 
 */
function getMonthlyOrQuarterReportPdf(req, res) {
  try{
    // calling to service method
    reportServ.getMonthlyOrQuarterReportPdf(req, res)
    .then(function (result) {
      res.send(result);
    }).catch(e => {
      winston.error("erorr while featching data at getMonthlyOrQuarterReportPdf() in controller file",e);
      res.status(500).send(e);
    });
  }catch(err){
    winston.error("error occured at getMonthlyOrQuarterReportPdf() in controller file",err);
    res.status(500).send(err);
    }
}

/**
 * numberOfProjectsPerUser is used to get the details of number of project created by user
 * @param {*} req 
 * @param {*} res 
 */
function numberOfProjectsPerUser(req, res) {
  try{
    // calling to service method
    reportServ.numberOfProjectsPerUser(req, res)
    .then(function (result) {
      res.send(result);
    }).catch(e => {
      winston.error("erorr while featching data at getDetailViewReportPdf() in controller file",e);
      res.status(500).send(e);
    });
  }catch(err){
    winston.error("error occured at getDetailViewReportPdf() in controller file",err);
    res.status(500).send(err);
    }
  }

  /**
 * getFullMonthlyOrQuarterPdf is used to generate the pdf file of monthwise and queaterly full report
 * @param {*} req 
 * @param {*} res 
 */
function getFullMonthlyOrQuarterPdf(req, res) {
  try{
    // calling to service method
    reportServ.getFullMonthlyOrQuarterPdf(req, res)
    .then(function (result) {
      res.send(result);
    }).catch(e => {
      winston.error("erorr while featching data at getFullMonthlyOrQuarterPdf() in controller file",e);
      res.status(500).send(e);
    });
  }catch(err){
    winston.error("error occured at getFullMonthlyOrQuarterPdf() in controller file",err);
    res.status(500).send(err);
    }
}


  /**
 * shareTaskPdf is used to generate the pdf file of current task
 * @param {*} req 
 * @param {*} res 
 */
function shareTaskPdf(req, res) {
  try{
    // calling to service method
    reportServ.shareTaskPdf(req, res)
    .then(function (result) {
      res.send(result);
    }).catch(e => {
      winston.error("erorr while featching data at shareTaskPdf() in controller file",e);
      res.status(500).send(e);
    });
  }catch(err){
    winston.error("error occured at shareTaskPdf() in controller file",err);
    res.status(500).send(err);
    }
}






  

  