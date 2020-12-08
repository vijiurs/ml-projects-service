/**
 * name : envVariables.js.
 * author : Aman Karki.
 * created-date : 19-June-2020.
 * Description : Required Environment variables .
 */

let table = require("cli-table");

let tableData = new table();

let enviromentVariables = {
  "APPLICATION_PORT" : {
    "message" : "Please specify the value for e.g. 4201",
    "optional" : false
  },
  "APPLICATION_ENV" : {
    "message" : "Please specify the value for e.g. local/development/qa/production",
    "optional" : false
  },
  "APPLICATION_BASE_URL" : {
    "message" : "Required Application base url",
    "optional" : false
  },
  "AUTHORIZATION" : {
    "message" : "Required Server authorization code",
    "optional" : false
  },
  "APPLICATION_BASE_HOST" : {
    "message" : "Required Base host",
    "optional" : false
  },
  "MONGODB_URL" : {
    "message" : "Required mongodb url",
    "optional" : false
  },
  "MONGODB_PORT" : {
    "message" : "Required mongodb port",
    "optional" : false
  },
  "MONGODB_DATABASE_NAME" : {
    "message" : "Required database",
    "optional" : false
  },
  "INTERNAL_ACCESS_TOKEN" : {
    "message" : "Required internal access token",
    "optional" : false
  },
  "MIGRATION_COLLECTION" : {
    "message" : "Required migrations collection name",
    "optional" : false
  },
  "MIGRATION_DIR" : {
    "message" : "Required migrations directory name",
    "optional" : false
  },
  "SLACK_COMMUNICATIONS_ON_OFF" : {
    "message" : "Enable/Disable slack communications",
    "optional" : false,
    "possibleValues" : [
      "ON",
      "OFF"
    ]
  },
  "SLACK_EXCEPTION_LOG_URL" : {
    "message" : "Enable/Disable slack exception log url",
    "optional" : false
  },
  "SLACK_TOKEN" : {
    "message" : "Required slack token",
    "optional" : true,
    "requiredIf" : {
      "key": "SLACK_COMMUNICATIONS_ON_OFF",
      "value" : "ON"
    }
  },
  "URL_PREFIX" : {
    "message" : "Required",
    "optional" : false
  },
  "ENABLE_CONSOLE_LOGGING" : {
    "message" : "Please specify the value for e.g. ON/OFF",
    "optional" : false
  },
  "ENABLE_FILE_LOGGING" : {
    "message" : "Please specify the value for e.g. ON/OFF",
    "optional" : false
  },
  "KENDRA_APPLICATION_ENDPOINT" : {
    "message" : "Required",
    "optional" : false
  },
  "CLOUD_STORAGE" : {
    "message" : "Required",
    "optional" : false
  },
  "GCP_BUCKET_NAME" : {
    "message" : "Required",
    "optional" : false
  },
  "PUBLIC_FOLDER_PATH" : {
    "message" : "Required",
    "optional" : false,
    "default" : "public" 
  },
  "CSV_REPORTS_PATH" : {
    "message" : "Required",
    "optional" : false,
    "default" : "reports" 
  },
  "SUNBIRD_SERIVCE_HOST" : {
    "message" : "Required",
    "optional" : false
  },
  "SUNBIRD_SERIVCE_BASE_URL" : {
    "message" : "Required",
    "optional" : false
  },
  "KAFKA_COMMUNICATIONS_ON_OFF" : {
    "message" : "Enable/Disable kafka communications",
    "optional" : false
  },
  "KAFKA_URL" : {
    "message" : "Required",
    "optional" : false
  },
  "NOTIFICATIONS_TOPIC" : {
    "message" : "Required",
    "optional" : false
  },
  "IMPROVEMENT_PROJECT_APP_TYPE" : {
    "message" : "Required",
    "optional" : false
  },
  "IMPROVEMENT_PROJECT_APP_NAME" : {
    "message" : "Required",
    "optional" : false
  }
}

let success = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : ""
    };

    if( 
      enviromentVariables[eachEnvironmentVariable].requiredIf
      && process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] 
      && process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value
    ) {
      tableObj[eachEnvironmentVariable].optional = false;
    }
  
    if( 
      !(process.env[eachEnvironmentVariable]) && 
      !(enviromentVariables[eachEnvironmentVariable].optional)
    ) {
      
      success = false;

      if( 
        enviromentVariables[eachEnvironmentVariable].default &&
        enviromentVariables[eachEnvironmentVariable].default != "" 
      ) {
        process.env[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].default;
      }

      if(
        enviromentVariables[eachEnvironmentVariable] && 
        enviromentVariables[eachEnvironmentVariable].message !== ""
      ) {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = "required";
      }

    } else {

      tableObj[eachEnvironmentVariable] = "Passed";
      
      if( 
        enviromentVariables[eachEnvironmentVariable].possibleValues &&
        !enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])
      ) {
        tableObj[eachEnvironmentVariable] = ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`;
      }
      
    }

    tableData.push(tableObj);
  })

  LOGGER.info(tableData.toString());

  return {
    success : success
  }
}


