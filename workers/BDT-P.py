#!/usr/local/bin/python3.7
import pika
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

data = json.dumps({
    'apk': 'todolist.apk',
    'zip-file': 'script-calabash.zip'
}, sort_keys=True)

channel.basic_publish(exchange='', routing_key='BDT_Test', body=data)
print(f" [x] Sent {data}")
connection.close()