var fs = require("fs");
let _ = require("lodash");
const FileType = require('file-type');
var rimraf = require("rimraf");


var config = require("./config/config.json");
let MongoClient = require("mongodb").MongoClient;
const { Storage } = require("@google-cloud/storage");





let tempFolder = "tmp";
const storage = new Storage({
    projectId: "shikshalokam",
    keyFilename: "gcp.json"
});




async function update() {

    var dbUrl = (config.DB_URL).split('/');
    let url = dbUrl[0] + "//" + dbUrl[2];
    let connection = await MongoClient.connect(url, { useNewUrlParser: true });
    console.log("Database connected");
    let db = connection.db(dbUrl[3]);

    let taskDocs = await db.collection('userProjectsTasks').find(
        { imageUrl: { $ne: null } }
    ).project({ imageUrl: 1, _id: 1, projectId: 1 }).toArray();


    

    await Promise.all(taskDocs.map(async function (tasks) {
        if (tasks.imageUrl) {
            var result;

            let fileInfo = await getFileType(tasks.imageUrl);

            if (fileInfo) {

                var timestamp = new Date().getUTCMilliseconds();
                let randomNumber = Math.floor((Math.random() * 10000) + 1);

                let fileName = timestamp + "_" + randomNumber + "_uploadImage." + fileInfo.ext;
                var dir = './' + tempFolder;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                let fileData = await createFile(dir + "/" + fileName, tasks.imageUrl);
                if (fileData) {
                    let projectInfo = await db.collection("userProjects").findOne({ _id: tasks.projectId });
                    if (projectInfo) {

                        let folderPath = projectInfo.userId;
                        let uploadResponse = await uploadFile(dir + "/" + fileName, folderPath + '/' + fileName);
                        
                        if(uploadResponse && uploadResponse.name) {
                            await db.collection("userProjectsTasks").findOneAndUpdate({ _id: tasks._id }, { $push: { attachments: uploadResponse.name } });
                        }
                        
                   

                    }

                }


            }
        }

    }))

   
    rimraf(tempFolder, function () { console.log("done"); });
    

};
update();

function createFile(fileName, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(fileName, data, 'base64', (err) => {
            if (err) throw err;
            resolve("created");
        });
    })
}

function getFileType(data) {
    return new Promise(async function (resolve, reject) {
        var bufferData = Buffer.from(data, 'base64');
        var mimeInfo = await FileType.fromBuffer(bufferData);
        resolve(mimeInfo);
    });
}

function uploadFile(fileName, filePath){
    return new Promise(async (resolve, reject) => {
        try {
            let bucket = config.gcp.bucketName;
            let gcpBucket = storage.bucket(bucket);

            let uploadedFile = await gcpBucket.upload(fileName,
                {
                    destination: filePath,
                    gzip: true,
                    metadata: {}
                }
            );

            return resolve(
                uploadedFile[0].metadata
            );

        } catch (err) {
            return reject(err);
        }
    })
}

