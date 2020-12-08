/**
 * name : dataSetUpload.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : Data set upload middleware.
 */

// Dependencies
const csv = require("csvtojson");

module.exports = async (req, res, next) => {
    if (req.method == "POST" && req.files && Object.keys(req.files).length > 0) {
        
        let isDataSetUploaded = false;

        Object.keys(req.files).forEach(filekey => {
            if(req.files[filekey].mimetype === "text/csv") {
                isDataSetUploaded = true;
            }
        })

        if(isDataSetUploaded) {

            let allRequestedFiles = Object.keys(req.files);

            for(let pointerToRequestedFile = 0; 
                pointerToRequestedFile<allRequestedFiles.length;
                pointerToRequestedFile++
                ) {
                    
                    let existingRequestedFile = 
                    allRequestedFiles[pointerToRequestedFile];

                    let csvData = await csv().fromString(
                        req.files[existingRequestedFile].data.toString()
                    );

                    req.csvData = csvData;
                    req.file = existingRequestedFile;
                  }
        }
    }

    next();
    return;
}