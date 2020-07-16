module.exports = {
  async up(db) {
    global.migrationMsg = "Create index in project template tasks";
    await db.collection('projectTemplateTasks').createIndex({ externalId : 1 });
    await db.collection('projectTemplateTasks').createIndex({ name : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
