# Password Encryption Package
Password Encryption Package es un paquete de Node.js diseñado para encriptar contraseñas utilizando bcrypt y almacenarlas de forma segura en una base de datos SQLite. El paquete incluye una API básica que puede integrarse fácilmente en aplicaciones web para gestionar contraseñas de forma segura.

## Características
Encriptación segura de contraseñas utilizando bcrypt.
Almacenamiento de contraseñas en una base de datos SQLite.
API sencilla para recibir contraseñas desde una página web o cualquier aplicación que utilice HTTP.
Ejemplo de uso con una interfaz web basada en HTML y JavaScript.

## Requisitos
Este paquete requiere Node.js y las siguientes dependencias:
        - Node.js (v14 o superior)
        - bcrypt (para la encriptación de contraseñas)
        - express (para manejar las peticiones HTTP)
        - sqlite3 (para el almacenamiento de contraseñas encriptadas)

## Instalación
Para instalar el paquete, ejecuta el siguiente comando:
npm install password-encryption-package o npm i password-encryption-web

## Uso
1. Configuración del Servidor
    Puedes utilizar este paquete para iniciar un servidor Express que maneje la encriptación de contraseñas y su almacenamiento en una base de datos SQLite.
2. Uso en una Aplicación Web
    Este paquete incluye una página web básica que puede usarse para enviar contraseñas a la API y recibir las contraseñas encriptadas.
3. Guardar Contraseñas en la Base de Datos
    El paquete incluye una base de datos SQLite para almacenar las contraseñas encriptadas. La base de datos se inicializa automáticamente cuando el servidor se ejecuta por primera vez