const { Client } = require('pg')
var nodemailer = require('nodemailer');
const connectionString = 'postgres://miller:Toby2015@localhost:5432/miso4208'

function getData(id) {
    const c = new Client({
        connectionString: connectionString,
    });
    c.connect();
    return new Promise(function (resolve, reject) {
        c.query(`select e.id as execution_id, e.execution_date, e.status, u.username, u.email, s.name as strategy_name, v.version_name, a.name as app_name
                from public.app_teststrategyexecution e
                inner join public.auth_user u on author_id = u.id
                inner join public.app_teststrategy s on test_strategy_id = s.id
                inner join public.app_version v on version_id = v.id
                inner join public.app_app a on app_id = a.id
                where e.id = $1::int`, [id], (err, res) => {
            if (err) {
                console.log(err.stack)
                c.end()
                reject(false);
            } else {
                c.end();
                console.log(res);
                resolve(res.rows[0]);
            }
        })
    })
}

const sendEmail = function(id) {
    getData(id).then(data => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'andrestrujillo098@gmail.com',
              pass: '93cc49b96eD'
            }
          });
          
          var mailOptions = {
            from: 'andrestrujillo098@gmail.com',
            to: data.email,
            subject: `La ejecución de la estrategia de pruebas ${data.strategy_name} (${data.execution_id}) terminó`,
            html: `<h1>Hola ${data.username},</h1>
            <br>
            <p>La ejecución de la estrategia de pruebas ${data.strategy_name} (${data.execution_id}) referente a la aplicación ${data.app_name} versión ${data.version_name}, iniciada en ${data.execution_date}, acaba de terminar.</p>
            <br>
            <h5>Por favor ingresa al <a href="http://127.0.0.1:8000/app/teststrategyexecution/${id}/change/">portal</a> para poder revisar los detalles.</h5>`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    })
}

module.exports = sendEmail;