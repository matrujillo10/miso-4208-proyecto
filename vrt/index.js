const cypress = require('cypress')
const fs = require('fs');
const recieve = require('./worker');
const rimraf = require("rimraf");
var extract = require('extract-zip');
const https = require('https');
var path = require('path')
var resolvePath = require('path').resolve
var recursive = require("recursive-readdir");
const resemble = require('resemblejs')

recieve((data) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync("./cypress.zip")) {
      fs.unlinkSync("./cypress.zip")
    }

    if (fs.existsSync("./images.zip")) {
      fs.unlinkSync("./images.zip")
    }

    rimraf.sync("cypress");
    rimraf.sync("images");

    const czip = fs.createWriteStream("./cypress.zip");
    https.get(data.cypress_zip, function (response) {
      response.pipe(czip);
      czip.on('finish', function () {
        extract(resolvePath("./cypress.zip"), { dir: resolvePath("./") }, function (err) {
          if (err) {
            console.log(err);
            reject({ status: 'error' })
          }
          const izip = fs.createWriteStream("./images.zip");
          https.get(data.images_zip, function (response) {
            response.pipe(izip);
            izip.on('finish', function () {
              extract(resolvePath("./images.zip"), { dir: resolvePath("./") }, function (err) {
                if (err) {
                  console.log(err);
                  reject({ status: 'error' })
                }
                // run cypress
                cypress.run({
                  spec: data.spec,
                  env: {
                    "trashAssetsBeforeRuns": true
                  }
                }).then((results) => {
                  var screenshots_path = results.config.screenshotsFolder;
                  recursive(screenshots_path, function (err, files) {
                    if (err) {
                      reject({ status: 'error' });
                    }
                    files = files.filter(e => fs.statSync(e).isFile());
                    console.log(files);
                    recursive(screenshots_path, function (err, images) {
                      if (err) {
                        reject({ status: 'error' });
                      }
                      images = images.filter(e => fs.statSync(e).isFile());
                      console.log(images);
                      var equivs = {}
                      for (let file of files) {
                        var fn = path.basename(file);
                        for (let image of images) {
                          if (fn == path.basename(image)) {
                            equivs[fn] = {
                              f1: file,
                              f2: image
                            };
                            break;
                          }
                        }
                      }
                      var promises = []
                      for (const key in equivs) {
                        promises.push(resemble(equivs[key].f1).compareTo(equivs[key].f2).ignoreLess()
                        .onComplete(function (data) {
                          var base64Data = data.getImageDataUrl().replace(/^data:image\/png;base64,/, "");
                          var comparsion_output_paht = `${path.parse(key).name}-comparsion.png`;
                          return new Promise((resolve, reject) => {
                            require("fs").writeFile(comparsion_output_paht, base64Data, 'base64', function (err) {
                              if (err) {
                                console.log(err);
                                reject(err)
                              }
                              resolve('')
                            });
                          })
                        }))
                      }
                      Promise.all(promises)
                      .then(a => {
                        resolve(a)
                      }).catch(e => {
                        reject(e)
                      })
                    });
                  });
                  console.log('Ok');
                  resolve({ status: 'ok' });
                }).catch((err) => {
                  console.error('err');
                  reject({ status: 'error' })
                })
              })
            });
          });
        })
      });
    });
  });
}, (error) => {
  console.log('No se pudo iniciar el worker');
  console.log(error);
});