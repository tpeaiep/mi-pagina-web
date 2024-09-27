const express = require('express');
const bodyParser = require('body-parser');
const { encryptPassword } = require('./lib/bcryptEncrypt');
const { initDatabase, savePassword } = require('./lib/database');

const app = express();
const port = 3000;

// Configurar body-parser para recibir datos en formato POST
app.use(bodyParser.urlencoded({ extended: true }));

// Hacer pública la carpeta de recursos estáticos (index.html)
app.use(express.static('public'));

// Endpoint para manejar la encriptación de la contraseña
app.post('/encrypt-password', async (req, res) => {
    const { password } = req.body;

    // Inicializar base de datos
    const db = initDatabase();

    try {
        // Encriptar la contraseña
        const encryptedPassword = await encryptPassword(password);
        
        // Almacenar la contraseña en la base de datos
        const result = await savePassword(db, encryptedPassword);
        console.log(result); // 'Password saved successfully'

        // Respuesta de éxito al navegador
        res.send(`<h2>¡Encriptación exitosa!</h2><p>Contraseña encriptada: ${encryptedPassword}</p>`);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error al encriptar la contraseña');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
