/**
 * name : app.js.
 * author : Aman Karki.
 * created-date : 13-July-2020.
 * Description : Root file.
 */

require("dotenv").config();

// express
const express = require("express");
const app = express();

// Health check
require("./healthCheck")(app);

// Setup application config, establish DB connections and set global constants.
global.config = require("./config/connections");
require("./config/globals")();

// Check if all environment variables are provided.
const environmentData = require("./envVariables")();

if (!environmentData.success) {
  LOGGER.error("Server could not start . Not all environment variable is provided");
  process.exit();
}

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
if ( process.env.APPLICATION_ENV == "development" ) {
  app.use(express.static("apidoc"));
  app.get(process.env.APIDOC_URL, (req, res) => {
    
    let urlArray = req.path.split("/");
    urlArray.splice(0, 3);
    let apidocPath = process.env.APIDOC_PATH + urlArray.join("/");

    res.sendFile(path.join(__dirname, apidocPath));
  });
}

app.all('*', (req, res, next) => {
  
  if(ENABLE_FILE_LOGGING === "ON") {
    LOGGER.info("Requests:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    })
  }


  if(process.env.ENABLE_CONSOLE_LOGGING === "ON") {
    console.log("-------Request log starts here------------------");
    console.log("Request URL: ", req.url);
    console.log("Request Headers: ", req.headers);
    console.log("Request Body: ", req.body);
    console.log("Request Files: ", req.files);
    console.log("-------Request log ends here------------------");
  }

  next();
});


// Router module
const router = require("./routes");

//add routing
router(app);

//listen to given port
app.listen(process.env.APPLICATION_PORT, () => {

  console.log("Environment : " + process.env.APPLICATION_ENV);

  console.log("Application is running on the port : " + process.env.APPLICATION_PORT);

});

module.exports = app;