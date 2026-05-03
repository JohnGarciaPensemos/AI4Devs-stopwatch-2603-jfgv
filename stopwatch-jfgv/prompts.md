Quiero crear una pequeña aplicación web que le permita el usuario:

Arrancar un cronómetro digital que le muestre en tiempo real el avance del reloj.
Arrancar una cuenta atrás desde una cantidad de horas, minutos y segundos hasta que llegue a cero. Debe ir mostrando el tiempo faltante para finalizar.
Esta aplicación web debe tener un estilo atractivo pero profesional.
Debe ser fácil de usar para que cualquier usuario le pueda sacar provecho.

Hice un prototipo del funcionamiento de la aplicación que subo como una imagen png para que sirva como guía del estilo.

Esta es la descripción del uso:

El usuario selecciona la opción de cronómetro, lo activa y en la pantalla se ve el avance del reloj. Después de un rato, el usuario oprime detener y en la pantalla se ve el tiempo transcurrido, y aparece un botón para volver a lanzar el cronómetro.
El usuario selecciona la opción de cuenta atrás, el sistema le pide que indique cuantas horas, minutos y segundos contará hacia atrás, el usuario ingresa la información solicitada y lo activa y en la pantalla se ve el retroceso del reloj. Cuando llega a cero, el reloj se detiene, muestra una alerta visual y aparece un botón para volver a lanzar la cuanta atrás editando el tiempo de conteo.
Ejemplos de uso:

El usuario lanza el cronómetro y a los 2 minutos y 33 segundos lo detiene. En la pantalla queda el reloj mostrando 00:02:30 y ahora se ve el botón para volver a iniciar el cronómetro.
El usuario lanza la cuenta atrás con 00:05:00. Cuando pasan los 5 minutos el reloj se detiene, muestra la alerta y se ve el botón volver a iniciar la cuenta atrás permitiendo cambiar las horas, minutos y segundos.
Como experto en programación web, crea esta aplicación con HTML 5, javascript Vanilla y CSS 3, sin incluir ninguna librería externa. Sigue las mejores prácticas de programación para estas tecnologías. Itera las veces que sea necesario.

Al final explícame el código desarrollado.

--- 

¡Excelente!

En estos pequeños proyectos acordamos que la página HTML debe seguir el siguiente template:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Timer and Countdown</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<h1>Timer and Countdown</h1>
<script src="script.js"></script>
</body>
</html>
Por tanto el código javascript debe estar en un archivo separado que se llame script.js, y los estilos en un archivo stiles.css.

Realiza los cambios para que queden los tres archivos html, js y css como lo mencioné antes. Garantiza que todo sigue funcionando adecuadamente.

---

Para concluir genera un texto que resuma TODO lo que has realizado para que me sirva como comentario del commit que voy a realizar.
