module.exports = {
  async up(db) {
    global.migrationMsg = "Create categories external id index in project templates";
    await db.collection('projectTemplates').createIndex({ "categories.externalId" : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
