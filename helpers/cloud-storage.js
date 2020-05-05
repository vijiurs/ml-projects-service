/**
 * External dependencies for the file
 */
var fs = require('fs');
var https = require('https');
var request = require('request');
const FileType = require('file-type');
const base64 = require('base64topdf');


/**
 * Internal dependencie files
 */
var config = require('../config/config.json');
var winston = require('../config/winston');
var httpRequest = require('./http-request');




var api = {};
api.getPreSignedUrl = getPreSignedUrl;
api.uploadFileToGcp = uploadFileToGcp;
module.exports = api;

/**
 *  is used to get communicate with kendra service to get presigned url
 * @name getPreSignedUrl
 * @param {*} inputData contains input data, 
 * @param token user token
 * @param userId user id
 */
async function getPreSignedUrl(input ,userId,token) {
    return new Promise(async function(resolve, reject){

        try {
            let headers = {
                'X-authenticated-user-token': token,
                'Content-Type': 'application/json'
            }
            let allFileNames = [];
            var requestFileNames = {}
            input.fileNames.map(file => {

                var fileName = userId + "/" + Math.floor(new Date() / 1000) + "_" + file;
                fileName = (fileName.replace(/\s+/g, '')).trim();
                requestFileNames[fileName] = file;
                allFileNames.push(fileName);
            })

            let requestBody = {
                fileNames: allFileNames,
                bucket: config.gcp.bucketName
            }
            let url = config.kendra_config.base + config.kendra_config.preSignedUrls;
            let response = await httpRequest.httpsPost(headers, requestBody, url);
            if (response.result && response.result.length > 0) {

                response.result = response.result.map(element => {
                    element.file = requestFileNames[element.file];
                    return element;
                })
            }
            resolve(response);

        } catch (ex) {
            console.log("ex", ex);
            winston.error("error in getPreSignedUrl", ex);
            reject({ status: "failed", mesage: ex });
        }
    });
}

/**
 *  upload file to gcp using preSignedUrl
 * @name uploadFileToGcp
 * @param fileData contains input data, 
 */
async function uploadFileToGcp(fileData,userId,token) {
    return new Promise(async function(resolve, reject) {

        try {


            let storedFilePath = [];
            let fileNameDetails = { fileNames : [] };
            let filesObj = { };

            await Promise.all(fileData.map(async function(fileDetails){

                let fileBase64Data = "";
                let fileInfo = {};
                if(fileDetails.name){
                    let ext =fileDetails.name.split('.');
                    fileInfo.ext = ext[1];

                    let splitData = fileDetails.data.split(',');
                    fileBase64Data = splitData[1]
                  
                }else{
                    fileInfo = await getFileType(fileDetails.data);

                    fileBase64Data = fileDetails.data;
                }
                
                let fileName =  Math.floor(new Date() / 1000) + "."+fileInfo.ext;
                fileNameDetails.fileNames.push(fileName);
                filesObj[fileName] =fileBase64Data;

            }));

            let response = await getPreSignedUrl(fileNameDetails,userId,token);

            if(response.status ==200){
                if(response.result){
                    await Promise.all(response.result.map(async function(fileResponseData){
                        let base64Data = filesObj[fileResponseData.file];

                        storedFilePath.push(fileResponseData.payload.sourcePath);
                        var headers = {
                            'Content-Type': "multipart/form-data"
                        };
                        fs.writeFile("temp/"+fileResponseData.file, base64Data,'base64' ,(err) => {

                            if(!err){
                                request({
                                    url: fileResponseData.url,
                                    method: "PUT",
                                    headers: headers,
                                    body: fs.createReadStream("temp/"+fileResponseData.file),
                                }, function (error, response, body){
                                  
                                   fs.unlink("temp/"+fileResponseData.file);
                                   if (error) {
                                       console.log("error",error);
                                        winston.error("Error at httpPost()" + error);
                                        // reject(response.statusCode);
                                        resolve({ status: "failed" , message:"failed while downloading file" });
                                    } else {
                                         resolve({ status: "success" , sourcePath:storedFilePath });
                                    }
                                });
                            }
                        });


                    }));
                }
            }else{
                resolve({ status:"failed" });
            }
               
        } catch (ex) {
            console.log("ex", ex);
            winston.error("error in while uploading file to gcp", ex);
            reject({ status: "failed", mesage: ex });
        }
    });
}

/**
 * @name getFileType
 * @param {*} data base 64 data 
 */
function getFileType(data) {
    return new Promise(async function (resolve, reject) {
        var bufferData = Buffer.from(data, 'base64');
        var mimeInfo = await FileType.fromBuffer(bufferData);
        resolve(mimeInfo);
    });
}