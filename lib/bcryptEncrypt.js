const bcrypt = require('bcrypt');

// Función para encriptar la contraseña
async function encryptPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

// Función para comparar la contraseña ingresada con la almacenada
async function comparePassword(password, hash) {
    if (!password || !hash) {
        throw new Error('Ambos argumentos son requeridos');
    }
    return await bcrypt.compare(password, hash);
}

module.exports = { encryptPassword, comparePassword };
