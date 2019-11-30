const cypress = require('cypress')
const fs = require('fs');
const recieve = require('./worker');
const rimraf = require("rimraf");
var extract = require('extract-zip');
const http = require('http');
var path = require('path')
var resolvePath = require('path').resolve
var recursive = require("recursive-readdir");
const resemble = require('resemblejs')


function generarReporte(data) {
  return `<div class="row">
            <div class="col-3"><img src="${data.base}" height="250" width="150"></div>
            <div class="col-3"><img src="${data.modified}" height="250" width="150"></div>
            <div class="col-3"><img src="${data.comparsion}" height="250" width="150"></div>
            <div class="col-3">${JSON.stringify(data.resemble)}</div>
        </div>
        <br>
        `;
}

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
    http.get(data.cypress_zip, function (response) {
      response.pipe(czip);
      czip.on('finish', function () {
        extract(resolvePath("./cypress.zip"), { dir: resolvePath("./") }, function (err) {
          if (err) {
            console.log(err);
            reject({ status: 'error' })
          }
          const izip = fs.createWriteStream("./images.zip");
          http.get(data.images_zip, function (response) {
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
                        promises.push(new Promise((resolve, reject) => {
                          resemble(equivs[key].f1).compareTo(equivs[key].f2).ignoreLess()
                          .onComplete(function (data) {
                            var base64Data = data.getImageDataUrl().replace(/^data:image\/png;base64,/, "");
                            var comparsion_output_paht = `output/${path.parse(key).name}-comparsion.png`;
                            require("fs").writeFile(comparsion_output_paht, base64Data, 'base64', function (err) {
                              if (err) {
                                console.log(err);
                                reject(err)
                              }
                              resolve(generarReporte({
                                base: equivs[key].f1,
                                modified: equivs[key].f2,
                                comparsion: comparsion_output_paht,
                                resemble: data
                              }))
                            });
                          })
                        }))
                      }
                      Promise.all(promises)
                      .then(a => {
                        var report = '';
                        for (let i of a) {
                          report += i;
                        }
                        var result = fs.readFileSync('index-template.html', "utf8").replace(/{{report}}/g, report)
                        fs.writeFile('vrt-report.html', result, 'utf8', function (err) {
                            if (err) return console.log(err);
                            resolve(true);
                        });
                      }).catch(e => {
                        reject(e)
                      })
                    });
                  });
                  console.log(results);
                  if (results.totalFailed > 0) {
                    resolve({status: 'ENDED WITH ERRORS'});
                  } else {
                    resolve({status: 'OK'});
                  }
                }).catch((err) => {
                  console.error(err);
                  reject({ status: 'ERROR' })
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