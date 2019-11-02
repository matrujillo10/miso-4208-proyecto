var amqp = require('amqplib/callback_api');
var uuid = require('uuid/v4');

const sendWork = function(data, testType, onSuccess, onFailure) {
    const workQueue = `workQueue-${testType}`
    console.log(`${workQueue}`)
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            onFailure(error0);
            return;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                onFailure(error1);
                return;
            }

            channel.assertQueue('', {
                exclusive: true
            }, function(error2, q) {
                if (error2) {
                    onFailure(error2);
                    return;
                }

                var correlationId = uuid();

            
                channel.consume(q.queue, function(msg) {
                    if (msg.properties.correlationId == correlationId) {
                        console.log(' [.] Got %s', msg.content.toString());
                        setTimeout(function() {
                            connection.close();
                            onSuccess(JSON.parse(msg.content.toString()));
                        }, 500);
                    }
                }, {
                    noAck: true
                });
        
                channel.sendToQueue(workQueue,
                    Buffer.from(JSON.stringify(data)), {
                    correlationId: correlationId, 
                    replyTo: q.queue
                    });
            });
        });
    });
}

module.exports = sendWork;