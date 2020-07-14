/**
 * name : index.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : All routes.
 */

// Dependencies
const authenticator = require(ROOT_PATH + "/generics/middleware/authenticator");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const pagination = require(ROOT_PATH + "/generics/middleware/pagination");
const fs = require("fs");
const inputValidator = require(ROOT_PATH + "/generics/middleware/validator");

module.exports = function (app) {

  const APPLICATION_BASE_URL = process.env.APPLICATION_BASE_URL;
  
  app.use(APPLICATION_BASE_URL, authenticator);
  app.use(APPLICATION_BASE_URL, pagination);

  var router = async function (req, res, next) {

    if (!req.params.version) {
      next();
    } else if (!controllers[req.params.version]) {
      next();
    } else if (!controllers[req.params.version][req.params.controller]) {
      next();
    }
    else if (!(controllers[req.params.version][req.params.controller][req.params.method] 
      || controllers[req.params.version][req.params.controller][req.params.file][req.params.method])) {
      next();
    }
    else if (req.params.method.startsWith("_")) {
      next();
    } else {

      try { 

        let validationError = req.validationErrors();

        if (validationError.length){
          throw { 
            status: httpStatusCode.bad_request.status, 
            message: validationError 
          };
        }

        let result;

        if (req.params.file) {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.file][req.params.method](req);
        } else {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.method](req);
        }

        if (result.isResponseAStream == true) {
          fs.exists(result.fileNameWithPath, function (exists) {

            if (exists) {

              res.setHeader(
                'Content-disposition', 
                'attachment; filename=' + result.fileNameWithPath.split('/').pop()
              );
              res.set('Content-Type', 'application/octet-stream');
              fs.createReadStream(result.fileNameWithPath).pipe(res);

            } else {

              throw {
                status : httpStatusCode.internal_server_error.status,
                message : httpStatusCode.internal_server_error.message
              };

            }

          });

        } else {
          res.status(result.status ? result.status : httpStatusCode["ok"].status).json({
            message: result.message,
            status: result.status ? result.status : httpStatusCode["ok"].status,
            result: result.data,
            result: result.result,
            additionalDetails: result.additionalDetails,
            pagination: result.pagination,
            totalCount: result.totalCount,
            total: result.total,
            count: result.count,
            failed: result.failed
          });
        }

        if(ENABLE_DEBUG_LOGGING === "ON") {
          logger.info("Response:", result);
        }

      }
      catch (error) {
        res.status(error.status ? error.status : httpStatusCode.bad_request.status).json({
          status: error.status ? error.status : httpStatusCode.bad_request.status,
          message: error.message
        });

        if ( error.status !== httpStatusCode.bad_request.status ) {
          
          let customFields = {
            appDetails: '',
            userDetails: "NON_LOGGED_IN_USER"
          };
  
          if (req.userDetails) {
            customFields = {
              appDetails: req.headers["user-agent"],
              userDetails: req.userDetails.firstName + " - " + req.userDetails.lastName + " - " + req.userDetails.email
            };
          }
  
          let toLogObject = {
            slackErrorName: process.env.SLACK_ERROR_NAME,
            color: process.env.SLACK_ERROR_MESSAGE_COLOR,
            method: req.method,
            url: req.url,
            body: req.body && !_.isEmpty(req.body) ? req.body : "not provided",
            errorMsg: "not provided",
            errorStack: "not provided"
          };
  
          if (error.message) {
            toLogObject["errorMsg"] = JSON.stringify(error.message);
          } else if (error.errorObject) {
            toLogObject["errorMsg"] = error.errorObject.message;
            toLogObject["errorStack"] = error.errorObject.stack;
          }
  
          slackClient.sendMessageToSlack(_.merge(toLogObject, customFields));
        }
        if(ENABLE_DEBUG_LOGGING === "ON") {
          logger.error("Error Response:", error);
        }
        
      };
    }
  };

  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:method", inputValidator, router);
  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:file/:method", inputValidator, router);
  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:method/:_id", inputValidator, router);
  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:file/:method/:_id", inputValidator, router);

  app.use((req, res, next) => {
    res.status(httpStatusCode["not_found"].status).send(httpStatusCode["not_found"].message);
  });
};
