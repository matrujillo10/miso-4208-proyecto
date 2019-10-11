#!/usr/local/bin/python3.7
import pika
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

data = json.dumps({
    'apk': 'org.wikipedia_10276_apps.evozi.com.apk',
    'package': 'org.wikipedia',
    'events': 100000,
    'seed': 1234
}, sort_keys=True)

channel.basic_publish(exchange='', routing_key='Random_Test', body=data)
print(f" [x] Sent {data}")
connection.close()