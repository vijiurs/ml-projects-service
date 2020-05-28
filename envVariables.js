let table = require("cli-table");
let tableData = new table();

let enviromentVariables = {

  "MONGODB_COMMUNICATIONS_ON_OFF" : {
    "message" : "Please specify the value for e.g. ON/OFF",
    "optional" : false,
    "possibleValues" : [
      "ON",
      "OFF"
    ]
  },

  "MONGODB_HOST_URL" : {
    "message" : "Please specify the value for e.g. localhost",
    "optional" : false,
    "requiredIf" : {
      "key": "MONGODB_COMMUNICATIONS_ON_OFF",
      "operator" : "EQUALS",
      "value" : "ON"
    }
  },

  "MONGODB_PORT" : {
    "message" : "Please specify the value for e.g. 27017",
    "optional" : false,
    "requiredIf" : {
      "key": "MONGODB_COMMUNICATIONS_ON_OFF",
      "operator" : "EQUALS",
      "value" : "ON"
    }
  },

  "MONGODB_DATABASE_NAME" : {
    "message" : "Please specify the value for e.g. bms",
    "optional" : false,
    "requiredIf" : {
      "key": "MONGODB_COMMUNICATIONS_ON_OFF",
      "operator" : "EQUALS",
      "value" : "ON"
    }
  },

  "MONGODB_USERNAME" : {
    "message" : "Please specify the value for username to connect to connect to MongoDB ",
    "optional" : true,
    "default" : ""
  },

  "MONGODB_PASSWORD" : {
    "message" : "Please specify the value for password to connect to connect to MongoDB ",
    "optional" : true,
    "default" : ""
  },

  "MIGRATIONS_COLLECTION" : {
    "message" : "Please specify the value for e.g. migrations",
    "optional" : false
  },

  "MIGRATIONS_DIR" : {
    "message" : "Please specify the value for e.g. migrations",
    "optional" : false
  },
}
const validRequiredIfOperators = [
  "EQUALS",
  "NOT_EQUALS"
];

let environmentVariablesCheckSuccessful = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
    let tableObj = {
      [eachEnvironmentVariable] : "PASSED"
    };
    let keyCheckPass = true;
    if(enviromentVariables[eachEnvironmentVariable].optional === true
      && enviromentVariables[eachEnvironmentVariable].requiredIf
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key != ""
      && enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      && validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator)
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value != "") {
        switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
          case "EQUALS":
            if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
              enviromentVariables[eachEnvironmentVariable].optional = false;
            }
            break;
          case "NOT_EQUALS":
              if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] != enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
                enviromentVariables[eachEnvironmentVariable].optional = false;
              }
              break;
          default:
            break;
        }
    }

    if(enviromentVariables[eachEnvironmentVariable].optional === false) {
      if(!(process.env[eachEnvironmentVariable])
        || process.env[eachEnvironmentVariable] == "") {
        environmentVariablesCheckSuccessful = false;
        keyCheckPass = false;
      } else if (enviromentVariables[eachEnvironmentVariable].possibleValues
        && Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues)
        && enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0) {
        if(!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])) {
          environmentVariablesCheckSuccessful = false;
          keyCheckPass = false;
          enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`
        }
      }
    }
    if((!(process.env[eachEnvironmentVariable])
      || process.env[eachEnvironmentVariable] == "")
      && enviromentVariables[eachEnvironmentVariable].default
      && enviromentVariables[eachEnvironmentVariable].default != "") {
      process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default;
    }
    if(!keyCheckPass) {
      if(enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }
    tableData.push(tableObj);
  })
  console.log(tableData.toString());
  return {
    success : environmentVariablesCheckSuccessful
  }
}