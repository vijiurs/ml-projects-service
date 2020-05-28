module.exports = {
  async up(db) {
    global.migrationMsg = "update external id to impTemplates"


    let impTemplateDocs = await db.collection("impTemplates").find({  externalId: { $eq:null } }).toArray();
    await Promise.all(impTemplateDocs.map(async function(document){

      let docId = document._id.toString();
      await db.collection("impTemplates").update({ _id:document._id },{ $set : { externalId :docId }  });

    }));

    await db.collection('impTemplates').createIndex({ 
      externalId : 1 
    },{ 
      unique : true 
    });


  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
