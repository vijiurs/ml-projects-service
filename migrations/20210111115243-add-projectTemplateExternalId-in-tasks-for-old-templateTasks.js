module.exports = {

  async up(db) {
    global.migrationMsg = "Add projectTemplateExternalId in templateTasks";

    let taskIds = await db.collection('projectTemplateTasks').find({
						    	"projectTemplateId": { $exists: true, $ne: null },
						    	"projectTemplateExternalId": { $exists: false }

					   		}).project({ _id: 1, projectTemplateId: 1 }).toArray();

    if(taskIds && taskIds.length > 0) {

    	for(let pointerToTask = 0; pointerToTask < taskIds.length; pointerToTask++){

    		let taskData = taskIds[pointerToTask];
    		let templateData = await db.collection('projectTemplates').findOne({ _id: taskData.projectTemplateId },{externalId: 1});

    		if(templateData){
    			await db.collection('projectTemplateTasks').updateOne({ _id: taskData._id }, { $set: { projectTemplateExternalId: templateData.externalId }});
    		}
        }
    }
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
