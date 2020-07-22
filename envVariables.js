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
  "SHIKSHALOKAM_BASE_HOST" : {
    "message" : "Required shikshalokam base host",
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
  "sunbird_url" : {
    "message" : "Required sunbird url",
    "optional" : false
  },
  "sunbird_keycloak_auth_endpoint" : {
    "message" : "Required sunbird keycloak auth endpoint",
    "optional" : false
  },
  "sunbird_keycloak_realm" : {
    "message" : "Required sunbird keycloak realm",
    "optional" : false
  },
  "sunbird_keycloak_client_id" : {
    "message" : "Required sunbird keycloak client id",
    "optional" : false
  },
  "sunbird_keycloak_public" : {
    "message" : "Required sunbird keycloak public",
    "optional" : false
  },
  "sunbird_cache_store" : {
    "message" : "Required sunbird cache store",
    "optional" : false
  },
  "sunbird_cache_ttl" : {
    "message" : "Required sunbird cache ttl",
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
    "optional" : false
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
  }
}

let success = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : ""
    };
  
    if( !(process.env[eachEnvironmentVariable]) && !(enviromentVariables[eachEnvironmentVariable].optional)) {
      success = false;

      if(enviromentVariables[eachEnvironmentVariable] && enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = "required";
      }
    } else {

      tableObj[eachEnvironmentVariable] = "success";

      if( 
        enviromentVariables[eachEnvironmentVariable].possibleValues &&
        !enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])
      ) {
        tableObj[eachEnvironmentVariable] += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`;
      } else {
        
        if(enviromentVariables[eachEnvironmentVariable].optional) {
          tableObj[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].message;
        }

      }
      
    }

    tableData.push(tableObj);
  })

  LOGGER.info(tableData.toString());

  return {
    success : success
  }
}


