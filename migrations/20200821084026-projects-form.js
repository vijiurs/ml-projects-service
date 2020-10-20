module.exports = {
  async up(db) {
    global.migrationMsg = "Create projects form.";

    let forms = [
      {
        field: "title",
        label: "Title",
        value: "",
        visible: true,
        editable: true,
        input: "text",
        validation: {
          required: true
        },
        max : 50,
        hint : "Name your project"
      },{
        field: "description",
        label: "Description",
        value: "",
        visible: true,
        editable: true,
        input: "textarea",
        validation: {
          required: true
        },
        max : 120,
        hint : "What is the Objective of your Project"
      },{
        field: "categories",
        label: "Categories",
        value: "",
        visible: true,
        editable: true,
        input: "select",
        options: [],
        validation: {
          required: false
        },
        hint : "What does your project aim to improve?"
      } 
    ];
    
    await db.collection('forms').insertOne({
      name: "projects",
      value: forms
    });

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
