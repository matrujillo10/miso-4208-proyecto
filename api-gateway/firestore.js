const admin = require('firebase-admin');
var uuid = require('uuid/v4');
var splitFilename = require('./utils')
var fs = require('fs');

let serviceAccount = require('./miso-4208-proyecto-c0c72-firebase-adminsdk-aa1av-4b78272919.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "scripts"
});

const bucket = admin.storage().bucket("miso-4208-proyecto-c0c72.appspot.com");

let db = admin.firestore();

/**
 * Upload the file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
const uploadFileToStorage = (file) => {
  return new Promise((resolve, reject) => {
      if (!file) {
        reject('No file');
      }
      var f = splitFilename(file.name)
      let newFileName = `${f.name}_${uuid()}${f.ext}`;

      let fileUpload = bucket.file(newFileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.type
        }
      });

      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', () => {
        fileUpload.getSignedUrl({
          action: 'read',
          expires: '12-31-2500'
        }, function(err, url) {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve({
            url: url, 
            fileName: newFileName
          });
        });
      });


      fs.readFile(file.path, function (err, data) {
        blobStream.end(data);
      });
      
  });
}

const deleteFileFromStorage = (fileName) => {
    return myBucket.file(fileName).delete()
}

module.exports = {
    db,
    uploadFileToStorage,
    deleteFileFromStorage
};