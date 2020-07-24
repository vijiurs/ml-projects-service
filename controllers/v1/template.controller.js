var express             = require('express');
var router              = express.Router();
var templateServe = require('../../services/template.service');

// routes
router.get('/all', getTemplates);
router.post('/getImprovementProjects',getImprovementProjects);
router.get('/getTemplateDetailsById/:id',getTemplateDetailsById);
module.exports = router;
function getTemplates(req, res) {
    templateServe.getTemplates(req,res)
        .then(function (result) {
            res.send(result);
        }).catch(e => {
            console.log("erorr while featching template data",e);
            res.send(e);
          });
}


function getImprovementProjects(req, res) {
    templateServe.getImprovementProjects(req,res)
        .then(function (result) {
            res.send(result);
        }).catch(e => {
            console.log("erorr while featching template data",e);
            res.send(e);
          });
}

function getTemplateDetailsById(req,res){
    templateServe.getTemplateDetailsById(req,res)
        .then(function (result) {
            res.send(result);
        }).catch(e => {
            console.log("erorr while featching template data by id",e);
            res.send(e);
          });
}