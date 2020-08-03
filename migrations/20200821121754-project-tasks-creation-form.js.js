module.exports = {
  async up(db) {
    
    global.migrationMsg = "Create project tasks form";
    
    let forms = [
      {
        field: "name",
        label: "Name",
        value: "",
        visible: true,
        editable: true,
        input: "text",
        validation: {
          required: true
        }
      },{
        field: "description",
        label: "Description",
        value: "",
        visible: true,
        editable: true,
        input: "textarea",
        validation: {
          required: true
        }
      }
    ];
    
    await db.collection('forms').insertOne({
      name: "projectTasks",
      value: forms
    });
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
