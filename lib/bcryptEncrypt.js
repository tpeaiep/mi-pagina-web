const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    encryptPassword: async (password) => {
        try {
            const hash = await bcrypt.hash(password, saltRounds);
            return hash;
        } catch (err) {
            throw new Error('Error encrypting password');
        }
    }
};
