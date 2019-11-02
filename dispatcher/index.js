const { Client } = require('pg');
var sendWork = require('./sender')
var getBDTData = require('./bdt_data_retriever')
var getRTData = require('./rt_data_retriever')
var getVRTData = require('./vrt_data_retriever')
var getE2EData = require('./e2e_data_retriever')
const connectionString = 'postgres://miller:Toby2015@localhost:5432/miso4208'

const client = new Client({
    connectionString: connectionString,
  });
client.connect();

function updateStatus(status, id, table) {
    const c = new Client({
        connectionString: connectionString,
    });
    c.connect();
    return new Promise(function(resolve, reject) {
        c.query(`update ${table} set status = '${status}' where id = $1::int`, [id], (err, res) => {
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

// Listen for all pg_notify channel messages
client.on('notification', function(msg) {
    console.log(msg);
    switch (msg.channel) {
        case 'bdt_execution':
            console.log('bdt_execution');
            getBDTData(msg.payload)
                .then(data => {
                    sendWork(data, 'BDT', function(response) {
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatus('OK', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('OK', data.id, 'public.app_bdttestexecution')
                            })
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('ERRROR', data.id, 'public.app_bdttestexecution')
                            })
                        }
                      }, function(error) {
                        console.log('Error sending the work', error);
                        updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                        .then(data => {
                            updateStatus('ERRROR', data.id, 'public.app_bdttestexecution')
                        })
                      })
                })
            break;
        case 'rt_execution':
            console.log('rt_execution');
            getRTData(msg.payload)
                .then(data => {
                    sendWork(data, 'RT', function(response) {
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatus('OK', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('OK', data.id, 'public.app_rttestexecution')
                            })
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('ERRROR', data.id, 'public.app_rttestexecution')
                            })
                        }
                      }, function(error) {
                        console.log('Error sending the work', error);
                        updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                        .then(data => {
                            updateStatus('ERRROR', data.id, 'public.app_rttestexecution')
                        })
                      })
                })
            break;
        case 'vrt_execution':
            console.log('vrt_execution');
            getVRTData(msg.payload)
                .then(data => {
                    sendWork(data, 'VRT', function(response) {
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatus('OK', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('OK', data.id, 'public.app_vrttestexecution')
                            })
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('ERRROR', data.id, 'public.app_vrttestexecution')
                            })
                        }
                      }, function(error) {
                        console.log('Error sending the work', error);
                        updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                        .then(data => {
                            updateStatus('ERRROR', data.id, 'public.app_vrttestexecution')
                        })
                      })
                })
            break;
        case 'e2e_execution':
            console.log('e2e_execution');
            getE2EData(msg.payload)
                .then(data => {
                    sendWork(data, 'E2E', function(response) {
                        if (response.status == 'ok') {
                            console.log('ok');
                            updateStatus('OK', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('OK', data.id, 'public.app_e2etestexecution')
                            })
                        } else {
                            console.log('El worker no pudo ejecutar el script.');
                            updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                            .then(data => {
                                updateStatus('ERRROR', data.id, 'public.app_e2etestexecution')
                            })
                        }
                      }, function(error) {
                        console.log('Error sending the work', error);
                        updateStatus('ERRROR', data.test_strategy_execution_id, 'public.app_teststrategyexecution')
                        .then(data => {
                            updateStatus('ERRROR', data.id, 'public.app_e2etestexecution')
                        })
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