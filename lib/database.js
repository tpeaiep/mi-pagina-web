const sqlite3 = require('sqlite3').verbose();

module.exports = {
    initDatabase: () => {
        const db = new sqlite3.Database('./database.db');
        db.run(`CREATE TABLE IF NOT EXISTS passwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            password TEXT NOT NULL
        )`);
        return db;
    },
    savePassword: (db, encryptedPassword) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO passwords (password) VALUES (?)`, [encryptedPassword], function (err) {
                if (err) {
                    reject('Error saving password');
                }
                resolve('Password saved successfully');
            });
        });
    }
};
