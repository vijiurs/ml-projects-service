module.exports = {
  async up(db) {
    global.migrationMsg = "Create index in projects";
    await db.collection('projects').createIndex({ userId : 1 });
    await db.collection('projects').createIndex({ entityType : 1 });
    await db.collection('projects').createIndex({ programId : 1 });
    await db.collection('projects').createIndex({ solutionId : 1 });
    await db.collection('projects').createIndex({ programExternalId : 1 });
    await db.collection('projects').createIndex({ solutionExternalId : 1 });
    await db.collection('projects').createIndex({ category : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
