const { Client } = require('pg');
var sendWork = require('./sender')
var getBDTData = require('./bdt_data_retriever')
var getRTData = require('./rt_data_retriever')
var getVRTData = require('./vrt_data_retriever')
var getE2EData = require('./e2e_data_retriever')
var getLighthouseData = require('./lighthouse_data_retriever')
var sendEmail = require('./email_sender')
const connectionString = 'postgres://miller:Toby2015@localhost:5432/miso4208'

const client = new Client({
    connectionString: connectionString,
});
client.connect();

function updateStatusTest(status, id, strategy_id, table) {
    const c = new Client({
        connectionString: connectionString,
    });
    c.connect();
    return new Promise(function (resolve, reject) {
        c.query(`update ${table} set status = '${status}' where id = $1::int`, [id], (err, res) => {
            if (err) {
                console.log(err.stack)
                c.end()
                reject('error')
            } else {
                c.end();
                isExecutionEnded(strategy_id).then(res => {
                    if (res) {
                        updateStatusStrategy("TERMINADA", strategy_id).then(res => {
                            sendEmail(strategy_id);
                        });
                    }
                    resolve('ok')
                })
            }
        })
    })
}

function updateStatusStrategy(status, id) {
    const c = new Client({
        connectionString: connectionString,
    });
    c.connect();
    return new Promise(function (resolve, reject) {
        c.query(`update app_teststrategyexecution set status = '${status}' where id = $1::int`, [id], (err, res) => {
            if (err) {
                console.log(err.stack)
                c.end()
                reject('error')
            } else {
                c.end();
                resolve('ok')
            }
        })
    })
}

function isExecutionEnded(id) {
    const c = new Client({
        connectionString: connectionString,
    });
    c.connect();
    return new Promise(function (resolve, reject) {
        c.query(`SELECT * from public."EXECUTION_ENDED"($1::int)`, [id], (err, res) => {
            if (err) {
                console.log(err.stack)
                c.end()
                reject(false);
            } else {
                c.end();
                console.log(res);
                resolve(res.rows[0].ended);
            }
        })
    })
}

// Listen for all pg_notify channel messages
client.on('notification', function (msg) {
    console.log(msg);
    switch (msg.channel) {
        case 'bdt_execution':
            console.log('bdt_execution');
            getBDTData(msg.payload)
                .then(data => {
                    console.log(data);
                    sendWork(data, 'BDT', function (response) {
                        console.log(response)
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatusTest('OK', msg.payload, data.test_strategy_execution_id, 'public.app_bdttestexecution')
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_bdttestexecution')
                        }
                    }, function (error) {
                        console.log('Error sending the work', error);
                        updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_bdttestexecution')
                    })
                })
            break;
        case 'rt_execution':
            console.log('rt_execution');
            getRTData(msg.payload)
                .then(data => {
                    console.log(msg.payload);
                    sendWork(data, 'RT', function (response) {
                        console.log(response)
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatusTest('OK', msg.payload, data.test_strategy_execution_id, 'public.app_rttestexecution')
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_rttestexecution')
                        }
                    }, function (error) {
                        console.log('Error sending the work', error);
                        updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_rttestexecution')
                    })
                })
            break;
        case 'vrt_execution':
            console.log('vrt_execution');
            getVRTData(msg.payload)
                .then(data => {
                    console.log(data);
                    sendWork(data, 'VRT', function (response) {
                        console.log(response)
                        updateStatusTest(response.status, msg.payload, data.test_strategy_execution_id, 'public.app_vrttestexecution')
                    }, function (error) {
                        console.log('Error sending the work', error);
                        updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_vrttestexecution')
                    })
                })
            break;
        case 'e2e_execution':
            console.log('e2e_execution');
            getE2EData(msg.payload)
                .then(data => {
                    console.log(data);
                    sendWork(data, 'E2E', function (response) {
                        console.log(response)
                        updateStatusTest(response.status, msg.payload, data.test_strategy_execution_id, 'public.app_e2etestexecution')
                    }, function (error) {
                        console.log('Error sending the work', error);
                        updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_e2etestexecution')
                    })
                })
            break;
        case 'lighthouse_execution':
            getLighthouseData(msg.payload)
                .then(data => {
                    console.log(data);
                    sendWork(data, 'lighthouse', function (response) {
                        console.log(response)
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatusTest('OK', msg.payload, data.test_strategy_execution_id, 'public.app_lighthouseexecution')
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_lighthouseexecution')
                        }
                    }, function (error) {
                        console.log('Error sending the work', error);
                        updateStatusTest('ERRROR', msg.payload, data.test_strategy_execution_id, 'public.app_lighthouseexecution')
                    })
                })
            break;
        default:
            console.log('No encontró canal');
            break;
    }
});

client.query('LISTEN bdt_execution');
client.query('LISTEN rt_execution');
client.query('LISTEN vrt_execution');
client.query('LISTEN e2e_execution');
client.query('LISTEN lighthouse_execution');