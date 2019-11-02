const { Client } = require('pg')
const host = require('./utils')

const getVRTData = function(id) {
    const connectionString = 'postgres://miller:Toby2015@localhost:5432/miso4208'
    const c1 = new Client({
        connectionString: connectionString,
    });
    c1.connect();

    return new Promise(function(resolve, reject) {
        c1.query(`
                select cypress_zip, images_zip, spec, url, test_strategy_execution_id
                from public.app_rttestexecution a 
                inner join public.app_vrttest b on a.vrt_test_id = b.id
                inner join public.app_teststrategy c on b.test_strategy_id = c.id
                inner join public.app_version d on c.version_id = d.id
                inner join public.app_app e on d.app_id = e.id
                where a.id = $1::int`, [id], (err, res) => {
            if (err) {
                console.log(err.stack)
                c1.end()
                reject('error')
            } else {
                data = res.rows[0]
                data.cypress_zip = host + data.cypress_zip
                data.images_zip = host + data.images_zip
                console.log(data)
                c1.end()
                const c2 = new Client({
                    connectionString: connectionString,
                });
                c2.connect();
                c2.query(`update public.app_vrttestexecution set status = 'PROCESANDO' where id = $1::int`, [id], (err, res) => {
                    if (err) {
                        console.log(err.stack)
                        c2.end()
                        reject('error')
                    } else {
                        c2.end()
                        if (data.test_strategy_execution_id != null && data.test_strategy_execution_id != undefined) {
                            const c3 = new Client({
                                connectionString: connectionString,
                            });
                            c3.connect();
                            c3.query(`update public.app_teststrategyexecution set status = 'PROCESANDO' where id = $1::int`, [data.test_strategy_execution_id], (err, res) => {
                                if (err) {
                                    console.log(err.stack)
                                    c3.end()
                                    reject('error')
                                } else {
                                    c3.end();
                                    resolve(data)
                                }
                            })
                        } else {
                            resolve(data)
                        }        
                    }
                })
                resolve(data)
            }
        })
    })
}

module.exports = getVRTData;