const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: user.id, rol: user.rol, nombre_completo: user.nombre_completo || user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, { httpOnly: false, secure: false }); // Asegúrate de que el nombre sea 'token'
            res.json({ message: 'Autenticación exitosa' });
        });
    });
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token'); // Elimina el token de las cookies
    res.redirect('/login.html'); // Redirige al usuario a la página de login
};
