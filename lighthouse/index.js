let exec = require('child_process').exec;
const recieve = require('./worker');

recieve((data) => {
    return new Promise((resolve, reject) => {
        exec(`lighthouse ${data.url}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Launcher failed while running the test suite', error.stacktrace);
                reject(error);
            } else {
                console.log('test suite run is finished')
                console.log('OK');
                resolve('OK');
            }
        });
    })
}, (error) => {
    console.log('No se pudo iniciar el worker');
    console.log(error);
})