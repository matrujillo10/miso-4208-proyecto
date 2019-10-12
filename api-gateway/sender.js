var amqp = require('amqplib/callback_api');
var uuid = require('uuid/v4');



const sendWork = function(data, testType, onSuccess, onFailure) {
    const statusQueue = `statusQueue-${testType}`
    const workQueue = `workQueue-${testType}`
    console.log(`${statusQueue}, ${workQueue}`)
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
                var status = []

            
                channel.consume(q.queue, function(msg) {
                    if (msg.properties.correlationId == correlationId) {
                        console.log(' [.] Got %s', msg.content.toString());
                        status.push(JSON.parse(msg.content.toString()));
                    }
                }, {
                    noAck: true
                });
        
                channel.sendToQueue(statusQueue,
                    Buffer.from(testType), { 
                    correlationId: correlationId, 
                    replyTo: q.queue
                    });

                setTimeout(function() {
                    if (status.length == 0) {
                        onFailure("No worker answer the request")
                    } else {
                        // TODO: Calcular a cual enviarlo y enviarlo a la cola de trabajo
                        var workerID = chooseWorker(status);
                        channel.assertQueue('', {
                            exclusive: true
                        }, function(error3, q) {
                            if (error3) {
                                onFailure(error3);
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

                            data.workerID = workerID;
                            console.log(data)
                            channel.sendToQueue(workQueue,
                            Buffer.from(JSON.stringify(data)), {
                                correlationId: correlationId, 
                                replyTo: q.queue 
                            });
                        });
                    }
                }, 1000);
            });
        });
    });
}

function chooseWorker(workers) {
    console.log(workers);
    var bestScore = -1.0;
    var workerID = null;
    workers.forEach(worker => {
        var currentScore = calculateScore(worker.CPU/100, worker.RAM);
        console.log(currentScore);
        if (currentScore > bestScore) {
            bestScore = currentScore;
            workerID = worker.ID;
        }
    });
    return workerID;
}

function calculateScore(cpu, ram) {
    return 2*ram/cpu;
}

module.exports = sendWork;