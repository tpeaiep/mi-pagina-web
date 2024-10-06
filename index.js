const express = require('express');
const bodyParser = require('body-parser');
const { encryptPassword, comparePassword } = require('./lib/bcryptEncrypt');
const { initDatabase, saveUser, savePassword, getUserByUsername } = require('./lib/database');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = initDatabase();

// Endpoint para manejar la creación de usuario
app.post('/create-user', async (req, res) => {
    const { username, email } = req.body;
    try {
        const userId = await saveUser(db, username, email);
        console.log(`Usuario creado con éxito: ${userId}`); // Imprimir ID en consola
        res.json({ userId: userId }); // Devuelve el userId
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error al crear el usuario');
    }
});

// Endpoint para manejar la encriptación de la contraseña
app.post('/encrypt-password', async (req, res) => {
    const { userId, password } = req.body;
    try {
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const hashedPassword = await encryptPassword(password);
        console.log(`Contraseña encriptada para el usuario ${userId}: ${hashedPassword}`); // Agregar log
        await savePassword(db, userId, hashedPassword);
        res.json({ encryptedPassword: hashedPassword });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).json({ error: 'Error al encriptar la contraseña' });
    }
});

// Endpoint para verificar la contraseña
app.post('/check-password', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userRow = await getUserByUsername(db, username);
        console.log('Datos del usuario:', userRow); // Imprimir datos del usuario para verificar

        if (!userRow || !userRow.id) {
            console.log('Usuario no encontrado o ID inválido');
            return res.json({ success: false });
        }

        const match = await comparePassword(password, userRow.password);
        if (match) {
            res.json({ success: true });
        } else {
            console.log('Las contraseñas no coinciden');
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        res.status(500).send('Error al verificar la contraseña');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});