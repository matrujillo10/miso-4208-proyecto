const path = require('path');
const configFile = path.resolve(__dirname, './wdio.conf.js');
const Launcher = require('@wdio/cli').default;
const wdio = new Launcher(configFile, {});
const recieve = require('./worker');
const https = require('https');
const fs = require('fs');
var uuid = require('uuid/v4');
let exec = require('child_process').exec;

recieve((data) => {
    return new Promise((resolve, reject) => {
        fs.readdir('./features/', (err, files) => {
            if (err) throw err;
            for (const file of files) {
                if (file.includes('step-definitions')) {
                    continue;
                }
                fs.unlinkSync(path.join('./features', file));
            }
            fs.readdir('./features/step-definitions', (err, files) => {
                if (err) throw err;
                for (const file of files) {
                    fs.unlinkSync(path.join('./features/step-definitions', file));
                }
                const feature = fs.createWriteStream(`./features/${uuid()}.feature`);
                https.get(data.feature, function (response) {
                    response.pipe(feature);
                    feature.on('finish', function () {
                        const steps = fs.createWriteStream(`./features/step-definitions/index.js`);
                        https.get(data.steps, function (response) {
                            response.pipe(steps);
                            steps.on('finish', function () {
                                exec('./node_modules/.bin/wdio wdio.conf.js', (error, stdout, stderr) => {
                                    if (error) {
                                        console.error('Launcher failed while running the test suite', error.stacktrace);
                                        reject(error);
                                    } else {
                                        console.log('test suite run is finished')
                                        console.log('OK');
                                        resolve('OK');
                                    }
                                })
                                /*wdio.run().then((code) => {
                                    console.log('test suite run is finished')
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
                });
            });
        });
    })
}, (error) => {
    console.log('No se pudo iniciar el worker');
    console.log(error);
})