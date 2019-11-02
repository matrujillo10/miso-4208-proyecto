const path = require('path');
//const configFile = path.resolve(__dirname, './wdio.conf.js');
//const Launcher = require('@wdio/cli').default;
//const wdio = new Launcher(configFile, {});
const recieve = require('./worker');
const http = require('http');
const fs = require('fs');
var uuid = require('uuid/v4');
let exec = require('child_process').exec;

recieve((data) => {
    return new Promise((resolve, reject) => {
        fs.readdir('./test/specs', (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlinkSync(path.join('./test/specs', file));
            }
            const test = fs.createWriteStream(`./test/specs/${uuid()}.js`);
            http.get(data.test, function (response) {
                response.pipe(test);
                test.on('finish', function () {
                    var result = fs.readFileSync('wdio-template.conf.js', "utf8")
                        .replace(/{{browserName}}/g, data.browser)
                        .replace(/{{browserVersion}}/g, data.browser_version == null ? 'latest' : data.browser_version)
                        .replace(/{{base_url}}/g, data.url);
                    fs.writeFile('wdio.conf.js', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                        exec('./node_modules/.bin/wdio wdio.conf.js', (error, stdout, stderr) => {
                            if (error) {
                                console.error('Launcher failed while running the test suite', error.stacktrace);
                                reject(error);
                            } else {
                                console.log('test suite run is finished')
                                console.log('OK');
                                resolve('OK');
                            }
                        });
                    });

                    /*wdio.run().then((code) => {
                        console.log('test suite run is finished')
                        console.log(code);
                        resolve(code);
                    }, (error) => {
                        console.error('Launcher failed while running the test suite', error.stacktrace);
                        reject(error);
                    }).catch((error) => {
                        console.error('Launcher failed while running the test suite', error.stacktrace);
                        reject(error);
                    });*/
                });
            });
        });
    })
}, (error) => {
    console.log('No se pudo iniciar el worker');
    console.log(error);
})