# miso-4208-proyecto

Se decidió realizar los diferentes componentes únicamente para aplicaciones web y sin una interfaz gráfica. Lo anterior teniendo en cuenta que el presupuesto asociado al proyecto son de aporximadamente 8h/hombre y 8h/máquina a la semana, contando únicamente con una persona para el proyecto.

# Arquitectura

La arquitectura del proyecto se mantiene casi igual. Sin embargo, debido a la reducción del presupuesto, se decidió cambiar el diseño del diagrama de despliegue. Además, debido al constante crecimiento de los componentes workers, en los diagramas se referirá a ellos como un único componente.

![](https://raw.githubusercontent.com/matrujillo10/miso-4208-proyecto/master/arquitectura/componentes.png)

<hr>

![](https://raw.githubusercontent.com/matrujillo10/miso-4208-proyecto/master/arquitectura/despliegue.png)

<hr>

![](https://raw.githubusercontent.com/matrujillo10/miso-4208-proyecto/master/arquitectura/load_balancing_queues.png)

# API Gateway

Debido a que no se cuenta con una interfaz gráfica, se piensa desarrollar un API Gateway que permita al usuario interactuar con los workers a través de la cola de mensajes. Aunque, se podría evitar contar con la cola, haciendo que el API llegue a los worker directamente, se considera que esta no es una buena desición debido a que impactaría la escalabilidad de la aplicación.

# Workers

Todos los workers se encuentran desarrollados en `node.js`. En general, reciben los archivos necesarios para poder ejecutar las pruebas y se comunican con el API a través de la cola de mensajes.

## Workers actuales

Actualmente se cuenta con workers para pruebas E2E, Random, BDT y VRT.
