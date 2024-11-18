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

// Estructura en memoria para controlar intentos fallidos y bloqueo
const loginAttempts = {}; // { username: { attempts: 0, lockedUntil: Date } }

// Tiempo de bloqueo (en milisegundos)
const LOCK_TIME = 5 * 60 * 1000; // 5 minutos

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

        // Revisar si el usuario está bloqueado
        const userAttempts = loginAttempts[username] || { attempts: 0, lockedUntil: null };
        if (userAttempts.lockedUntil && new Date() < userAttempts.lockedUntil) {
            return res.status(403).json({
                success: false,
                message: 'La cuenta está bloqueada. Inténtelo más tarde.',
            });
        }

        const userRow = await getUserByUsername(db, username);
        if (!userRow) {
            console.log('Usuario no encontrado en la base de datos.');
            return res.status(404).json({ success: false, message: 'El usuario no existe. Por favor, regístrese.' });
        }

        const match = await comparePassword(password, userRow.password);
        if (match) {
            // Restablecer intentos después de inicio de sesión exitoso
            delete loginAttempts[username];
            return res.json({ success: true, message: 'Inicio de sesión exitoso.' });
        } else {
            console.log('Las contraseñas no coinciden.');

            // Incrementar intentos fallidos
            userAttempts.attempts = (userAttempts.attempts || 0) + 1;
            if (userAttempts.attempts >= 3) {
                userAttempts.lockedUntil = new Date(Date.now() + LOCK_TIME);
                loginAttempts[username] = userAttempts;
                return res.status(403).json({
                    success: false,
                    message: 'Demasiados intentos fallidos. La cuenta está bloqueada por 5 minutos.',
                });
            }

            loginAttempts[username] = userAttempts;
            return res.json({ success: false, message: 'Contraseña incorrecta.' });
        }
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        res.status(500).json({ success: false, message: 'Error al verificar la contraseña.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});