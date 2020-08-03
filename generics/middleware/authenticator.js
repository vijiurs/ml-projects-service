/**
 * name : authenticator.js
 * author : Aman Karki
 * Date : 05-Aug-2020
 * Description : Authentication middleware. Call sunbird service for authentication.
 */

// dependencies
const sunbirdHelper = require(GENERICS_FILES_PATH + "/services/sunbird");

var respUtil = function (resp) {
  return {
    status: resp.errCode,
    message: resp.errMsg,
    currentDate: new Date().toISOString()
  };
};

var removedHeaders = [
  "host",
  "origin",
  "accept",
  "referer",
  "content-length",
  "accept-encoding",
  "accept-language",
  "accept-charset",
  "cookie",
  "dnt",
  "postman-token",
  "cache-control",
  "connection"
];

module.exports = async function (req, res, next, token = "") {

  removedHeaders.forEach(function (e) {
    delete req.headers[e];
  });

  var token = req.headers["x-authenticated-user-token"];
  if (!req.rspObj) req.rspObj = {};
  var rspObj = req.rspObj;


  // Allow search endpoints for non-logged in users.
  let guestAccess = false;
  let guestAccessPaths = [];
  await Promise.all(guestAccessPaths.map(async function (path) {
    if (req.path.includes(path)) {
      guestAccess = true;
    }
  }));
  
  if(guestAccess==true) {
    next();
    return;
  }

  let internalAccessApiPaths = [];
  let performInternalAccessTokenCheck = false;
  await Promise.all(internalAccessApiPaths.map(async function (path) {
    if (req.path.includes(path)) {
      performInternalAccessTokenCheck = true;
    }
  }));

  if (performInternalAccessTokenCheck) {
    if (req.headers["internal-access-token"] == process.env.INTERNAL_ACCESS_TOKEN) {
      next();
      return;
    } else {
      rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE;
      rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE;
      rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status;
      return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(respUtil(rspObj));
    }
  }


  let tokenOrInternalAccessTokenRequiredPaths = [];
  let tokenOrInternalAccessTokenRequired = false;
  await Promise.all(tokenOrInternalAccessTokenRequiredPaths.map(async function (path) {
    if (req.path.includes(path)) {
      tokenOrInternalAccessTokenRequired = true;
    }
  }));

  if (tokenOrInternalAccessTokenRequired) {
    if (req.headers["internal-access-token"] == process.env.INTERNAL_ACCESS_TOKEN || token) {
      next();
      return;
    } else {
      rspObj.errCode = CONSTANTS.apiResponses.MISSING_TOKEN_OR_INTERNAL_ACCESS_TOKEN_CODE;
      rspObj.errMsg = CONSTANTS.apiResponses.MISSING_TOKEN_OR_INTERNAL_ACCESS_TOKEN_MESSAGE;
      rspObj.responseCode = HTTP_STATUS_CODE["unauthorized"].status;
      return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(respUtil(rspObj));
    }
  }

  let securedApiPaths = [];
  let tokenAndInternalAccessTokenRequired = false;
  await Promise.all(securedApiPaths.map(async function (path) {
    if (req.path.includes(path)) {
      tokenAndInternalAccessTokenRequired = true;
    }
  }));

  if (tokenAndInternalAccessTokenRequired) {
    if (req.headers["internal-access-token"] == process.env.INTERNAL_ACCESS_TOKEN && token) {
      next();
      return;
    } else {
      rspObj.errCode = CONSTANTS.apiResponses.MISSING_TOKEN_AND_INTERNAL_ACCESS_TOKEN_CODE;
      rspObj.errMsg = CONSTANTS.apiResponses.MISSING_TOKEN_AND_INTERNAL_ACCESS_TOKEN_MESSAGE;
      rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status;
      return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(respUtil(rspObj));
    }
  }


  if (!token) {
    rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE;
    rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE;
    rspObj.responseCode = HTTP_STATUS_CODE["unauthorized"].status;
    return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(respUtil(rspObj));
  }

  sunbirdHelper
    .verifyToken(token)
    .then(async userDetails => {
      if (userDetails.result.isValid == true) {
        req.userDetails = {};
        req.userDetails = userDetails.result;
        req.userDetails['userToken'] = token;
        next();
      } else {
        rspObj.errCode = CONSTANTS.apiResponses.TOKEN_INVALID_CODE;
        rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_INVALID_MESSAGE;
        rspObj.responseCode = HTTP_STATUS_CODE["unauthorized"].status;
        return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(respUtil(rspObj));
      }

    }).catch(error => {
      return res.status(HTTP_STATUS_CODE["unauthorized"].status).send(error);
    });

};