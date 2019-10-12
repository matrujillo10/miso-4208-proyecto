#!/usr/local/bin/python3.7
import pika
import os
import json
import subprocess


connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    data = json.loads(body)
    print(data)
    # Descomprime el proyecto de calabash
    # TODO
    # Mueve el apk al directorio
    # os.system(f"cp {data['apk']} {dir_name}")
    # Cambia de directorio
    # os.chdir(os.open(dir_name, os.O_RDWR))
    # Genera certificado
    os.system(f"calabash-android resign {data['apk']}")
    # Corre el test
    os.system(f"calabash-android run {data['apk']}")

channel.basic_consume(
    queue='BDT_Test', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
