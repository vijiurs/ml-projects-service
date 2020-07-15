module.exports = {
  async up(db) {
    global.migrationMsg = "Create index in project attributes";
    await db.collection('projectAttributes').createIndex({ externalId : 1 });
    await db.collection('projectAttributes').createIndex({ name : 1 });
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
