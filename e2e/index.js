const cypress = require('cypress')
const fs = require('fs');
const recieve = require('./worker');
const rimraf = require("rimraf");
var extract = require('extract-zip');
const https = require('https');
var resolvePath = require('path').resolve

recieve((data) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync("./cypress.zip")) {
      fs.unlinkSync("./cypress.zip")
    }
    rimraf.sync("cypress");
    const czip = fs.createWriteStream("./cypress.zip");
    https.get(data.zip, function (response) {
      response.pipe(czip);
      czip.on('finish', function () {
        extract(resolvePath("./cypress.zip"), { dir: resolvePath("./")}, function (err) {
          if (err) {
            console.log(err);
            reject({status: 'error'})
          }
          // run cypress
          cypress.run({
            spec: data.spec,
            env: {
              "trashAssetsBeforeRuns": true
            }
          }).then((results) => {
            console.log('Ok');
            resolve({status: 'ok'});
          }).catch((err) => {
            console.error('err');
            reject({status: 'error'})
          })
        })
      });
    });
  });
}, (error) => {
  console.log('No se pudo iniciar el worker');
  console.log(error);
});