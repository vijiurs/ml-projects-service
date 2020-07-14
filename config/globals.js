/**
 * name : globals.js
 * author : Aman Karki
 * created-date : 13-July-2020
 * Description : Globals data.
*/

// dependencies

const fs = require("fs");
const path = require("path");
let requireAll = require("require-all");
var bunyan = require("bunyan"),
  bunyanFormat = require('bunyan-format'),
  formatOut = bunyanFormat({ outputMode: 'short' });

gen = Object.assign(global, {});

module.exports = function () {
  global.async = require("async");
  global.ROOT_PATH = path.join(__dirname, '..');
  global.MODULES_BASE_PATH = ROOT_PATH + "/module";
  global.GENERIC_HELPERS_PATH = ROOT_PATH + "/generics/helpers";
  global._ = require("lodash");
  gen.utils = require(ROOT_PATH + "/generics/helpers/utils");
  global.config = require(".");

  global.ENABLE_DEBUG_LOGGING = 
  process.env.ENABLE_DEBUG_LOGGING 
  || process.env.DEFAULT_ENABLE_DEBUG_LOGGING;

  global.locales = [];

  global.httpStatusCode = 
  require(ROOT_PATH + "/generics/http-status-codes");

  global.REQUEST_TIMEOUT_FOR_REPORTS = 
  process.env.REQUEST_TIMEOUT_FOR_REPORTS || 
  process.env.DEFAULT_REQUEST_TIMEOUT_FOR_REPORTS;

  // Load database models.
  global.models = requireAll({
    dirname: ROOT_PATH + "/models",
    filter: /(.+)\.js$/,
    resolve: function (Model) {
      return Model;
    }
  });

  //load base v1 controllers
  let pathToController = ROOT_PATH + "/controllers/v1/";

  fs.readdirSync(pathToController).forEach(function (file) {
    checkWhetherFolderExistsOrNot(pathToController, file);
  });

  /**
 * Check whether folder exists or Not.
 * @method
 * @name checkWhetherFolderExistsOrNot
 * @param {String} pathToFolder - path to folder.
 * @param {String} file - File name.
 */

  function checkWhetherFolderExistsOrNot(pathToFolder, file) {

    let folderExists = fs.lstatSync(pathToFolder + file).isDirectory();

    if (folderExists) {
      fs.readdirSync(pathToFolder + file).forEach(function (folderOrFile) {
        checkWhetherFolderExistsOrNor(pathToFolder + file + "/", folderOrFile);
      })

    } else {
      if (file.match(/\.js$/) !== null) {
        require(pathToFolder + file);
      }
    }

  }

  // Schema for db.
  global.schemas = new Array
  fs.readdirSync(ROOT_PATH + '/models/').forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('.js', '');
      global.schemas[name] = require(ROOT_PATH + '/models/' + file);
    }
  });

  // All controllers
  global.controllers = requireAll({
    dirname: ROOT_PATH + "/controllers",
    resolve: function (Controller) {
      return new Controller();
    }
  });

  // Message constants
  global.constants = new Array
  fs.readdirSync(ROOT_PATH + "/generics/constants")
  .forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      let name = file.replace('.js', '');
      name = gen.utils.hyphenCaseToCamelCase(name);
      global.constants[name] = 
      require(ROOT_PATH + "/generics/constants/" + file);
    }
  });

  let loggerPath = ROOT_PATH + "/logs/" + process.pid + "-all.log";
  
  // Load logger file
  global.logger = bunyan.createLogger({
    name: 'information',
    level: "debug",
    streams: [{
      stream: formatOut
    }, {
      type: "rotating-file",
      path: loggerPath,
      period: "1d", // daily rotation
      count: 3 // keep 3 back copies
    }]
  });

  global.sessions = {};

};
