const sqlite3 = require('sqlite3').verbose();

const initDatabase = () => {
    const db = new sqlite3.Database('./database.db');

    // Crear las tablas si no existen
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        password TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    return db;
};

const saveUser = (db, username, email) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (username, email) VALUES (?, ?)`, [username, email], function(err) {
            if (err) {
                return reject('Error saving user: ' + err.message);
            }
            resolve(this.lastID); // Retornar el ID del nuevo usuario
        });
    });
};

const savePassword = (db, userId, encryptedPassword) => {
    return new Promise((resolve, reject) => {
        console.log(`Guardando contraseña para el usuario ID: ${userId} con el hash: ${encryptedPassword}`);
        
        if (!userId || isNaN(userId)) {
            return reject('ID de usuario inválido');
        }

        db.run(`INSERT INTO passwords (user_id, password) VALUES (?, ?)`, [userId, encryptedPassword], function(err) {
            if (err) {
                return reject('Error saving password: ' + err.message);
            }
            resolve('Password saved successfully');
        });
    });
};

const getUserByUsername = (db, username) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT u.id, u.username, p.password FROM users u LEFT JOIN passwords p ON u.id = p.user_id WHERE u.username = ?`, [username], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

const getPasswordByUserId = (db, userId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM passwords WHERE user_id = ?`, [userId], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row); // Devolverá la fila que contiene la contraseña
        });
    });
};

module.exports = {
    initDatabase,
    saveUser,
    savePassword,
    getUserByUsername,
    getPasswordByUserId
};