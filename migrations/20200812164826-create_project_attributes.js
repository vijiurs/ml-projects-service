module.exports = {
  async up(db) {
    global.migrationMsg = "Create Project attributes"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    let projectAttributes = ["approaches",
      "successIndicators",
      "suggestedProject",
      "assumptions", "prerequisites",
      "problemDefinition",
      "vision",
      "protocols",
      "primaryAudience",
      "risks",
      "rationale",
      "duration"

    ];

    function camelCaseToTitleCase(in_camelCaseString) {
      var result = in_camelCaseString
        .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
        .trim();
      return result.charAt(0).toUpperCase() + result.slice(1);
    }



    let attributes = [];

    projectAttributes.map(attribute => {

      var defaultInput = {
        "externalId": attribute,
        "name": camelCaseToTitleCase(attribute),
        "input": "text",
        "options": [],
        "createdAt": moment().format(),
        "updatedAt": moment().format(),
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "isDeleted": false,
        "isVisible": true,
        "status": "active"
      }

      if (attribute == "duration") {
        defaultInput["input"] = "radio";
        defaultInput["options"] = [
          {
            "value": "1W",
            "label": "1 Week"
          },
          {
            "value": "1M",
            "label": "1 Month"
          }
        ];
      }else if (attribute == "primaryAudience") {
        defaultInput["options"] = [
          {
            "value": "hm",
            "label": "Headmaster"
          },
          {
            "value": "teacher",
            "label": "Teacher"
          }
        ];
      }

      if(attribute=="approaches" || attribute=="successIndicators" || attribute == "primaryAudience"){
        defaultInput["input"] = "multiselect";
      }
      attributes.push(defaultInput); 

    });

    await db.collection('projectAttributes').insertMany(attributes);

  },

  async down(db) {
  }
};
