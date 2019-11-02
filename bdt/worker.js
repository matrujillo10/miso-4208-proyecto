var amqp = require('amqplib/callback_api');
var uuid = require('uuid/v4');
const si = require('systeminformation');

const workQueue = 'workQueue-BDT'

const workerType = 'BDT'
var workerID = uuid()

const recieve = function (onSuccess, onFailure) {
    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            onFailure(error0)
            return;
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                onFailure(error1)
                return;
            }
            
            channel.assertQueue(workQueue, {
                durable: false
            });

            channel.consume(workQueue, function reply(msg) {
                console.log(" [.] Recibido workQueue");
                var data = JSON.parse(msg.content.toString())
                console.log(data);
                onSuccess(data).then(ans => {
                    // TODO: Enviar el reporte cuando se esté generando
                    channel.sendToQueue(msg.properties.replyTo,
                        Buffer.from(JSON.stringify({status: 'ok'})), {
                        correlationId: msg.properties.correlationId
                    });
                }).catch(err => {
                    console.log(err);
                    channel.sendToQueue(msg.properties.replyTo,
                        Buffer.from(JSON.stringify({status: 'error'})), {
                        correlationId: msg.properties.correlationId
                    });
                })
                channel.ack(msg);
            });
        });
    });
}

module.exports = recieve;