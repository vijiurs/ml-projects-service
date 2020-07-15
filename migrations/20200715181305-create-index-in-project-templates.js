module.exports = {
  async up(db) {
    global.migrationMsg = "Create index in project templates";
    await db.collection('projectTemplates').createIndex({ externalId : 1 });
    await db.collection('projectTemplates').createIndex({ name : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
