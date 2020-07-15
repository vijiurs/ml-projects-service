/**
 * name : app.js.
 * author : Aman Karki.
 * created-date : 13-July-2020.
 * Description : Root file.
 */

require("dotenv").config();

// Setup application config, establish DB connections and set global constants.
global.config = require("./config/connections");
require("./config/globals")();

// Check if all environment variables are provided.
const environmentData = require("./envVariables")();

if (!environmentData.success) {
  logger.error("Server could not start . Not all environment variable is provided");
  process.exit();
}

// Router module
const router = require("./routes");

// express
const express = require("express");
const app = express();

//required modules
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const expressValidator = require('express-validator');

//To enable cors
app.use(cors());
app.use(expressValidator())

//health check
app.get(process.env.HEALTH_CHECK_URL, (req, res) => {
  res.send("pong!");
});

app.use(fileUpload());
app.use(bodyParser.json({ limit: process.env.BODY_PARSER_LIMIT }));
app.use(bodyParser.urlencoded({ 
  limit: process.env.BODY_PARSER_LIMIT, 
  extended: false 
}));

app.use(express.static("public"));

fs.existsSync(process.env.LOGGER_DIRECTORY) || 
fs.mkdirSync(process.env.LOGGER_DIRECTORY);

//API documentation (apidoc)
if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "local") {
  app.use(express.static("apidoc"));
  if (process.env.NODE_ENV == "local") {
    app.get(process.env.DEFAULT_APIDOC_URL, (req, res) => {
      let apidocPath =  process.env.APIDOC_PATH + "/index.html";

      res.sendFile(path.join(__dirname, apidocPath));
    });
  } else {
    app.get(process.env.APIDOC_URL, (req, res) => {
      let urlArray = req.path.split("/");
      urlArray.splice(0, 3);
      let apidocPath = process.env.APIDOC_PATH + urlArray.join("/");

      res.sendFile(path.join(__dirname, apidocPath));
    });
  }
}

app.all('*', (req, res, next) => {
  if(ENABLE_DEBUG_LOGGING === "ON") {
    logger.info("Requests:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    })
  }

  next();
});

//add routing
router(app);

//listen to given port
app.listen(process.env.PORT, () => {

  logger.info("Environment: " +
    (process.env.NODE_ENV ? process.env.NODE_ENV : process.env.DEFAULT_NODE_ENV));

  logger.info("Application is running on the port:" + process.env.PORT);

});

module.exports = app;