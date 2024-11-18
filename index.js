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

// Funciones de validación
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (username) => /^[a-zA-Z0-9]+$/.test(username);
const isValidPassword = (password) => password.length >= 8;

// Endpoint para manejar la creación de usuario
app.post('/create-user', async (req, res) => {
    const { username, email } = req.body;

    // Validaciones
    if (!isValidUsername(username)) {
        return res.status(400).json({ error: 'El nombre de usuario solo puede contener letras y números' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Correo electrónico no válido' });
    }

    try {
        const userId = await saveUser(db, username, email);
        console.log(`Usuario creado con éxito`); // Imprimir ID en consola
        res.json({ userId: userId }); // Devuelve el userId
    } catch (error) {
        console.error('Error al crear el usuario. Correo ya utilizado', error);
        res.status(500).send('El correo electrónico ya está registrado');
    }
});

// Endpoint para manejar la encriptación de la contraseña
app.post('/encrypt-password', async (req, res) => {
    const { userId, password } = req.body;

    // Validación de contraseña
    if (!isValidPassword(password)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'Usuario inválido' });
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
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'El usuario y la contraseña son obligatorios.' });
        }

        const userRow = await getUserByUsername(db, username);
        if (!userRow) { // Validación más explícita para cuando el usuario no existe
            console.log('Usuario no encontrado en la base de datos.');
            return res.status(404).json({ success: false, message: 'El usuario no existe. Por favor, registrese.' });
        }

        const match = await comparePassword(password, userRow.password);
        if (match) {
            res.json({ success: true, message: 'Inicio de sesión exitoso.' });
        } else {
            console.log('Las contraseñas no coinciden.');
            res.json({ success: false, message: 'Contraseña incorrecta.' });
        }
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        res.status(500).json({ success: false, message: 'Error al verificar la contraseña.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});