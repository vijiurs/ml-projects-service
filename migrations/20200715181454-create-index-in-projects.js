module.exports = {
  async up(db) {
    global.migrationMsg = "Create index in projects";
    await db.collection('projects').createIndex({ userId : 1 });
    await db.collection('projects').createIndex({ entityType : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
