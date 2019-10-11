#!/usr/local/bin/python3.7
import pika
import os
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    data = json.loads(body)
    print(data)
    # Instala la app
    os.system(f"adb install {data['apk']}")
    # Ejecuta las pruebas aleatorias con la cantidad de eventos dados
    os.system(f"adb shell monkey -p {data['package']} -v {data['events']} -s {data['seed']}")
    # Desinstalar de la app:
    os.system(f"adb shell am force-stop {data['package']}")
    os.system(f"adb shell pm clear {data['package']}")
    os.system(f"adb uninstall {data['package']}")

channel.basic_consume(
    queue='Random_Test', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
