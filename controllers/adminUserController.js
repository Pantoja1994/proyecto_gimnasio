// adminUserController.js
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Asegúrate de que esta ruta es correcta

// Función para crear un nuevo usuario con rol
exports.createUser = async (req, res) => {
    const { username, password, nombre_completo, rol } = req.body;

    try {
        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserta el usuario en la base de datos
        const sql = 'INSERT INTO users (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)';
        db.query(sql, [username, hashedPassword, nombre_completo, rol], (err, result) => {
            if (err) {
                console.error('Error al insertar usuario en la base de datos:', err);
                return res.status(500).json({ message: 'Error al crear usuario' });
            }
            res.status(201).json({ message: 'Usuario creado exitosamente' });
        });
    } catch (error) {
        console.error('Error en la creación del usuario:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Función para obtener todos los usuarios del sistema en formato de cards
exports.getUsers = (req, res) => {
    const query = 'SELECT id, username, nombre_completo, rol FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            return res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
        res.status(200).json(results);
    });
};

// Función para actualizar un usuario
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { username, nombre_completo, rol } = req.body;

    const query = 'UPDATE users SET username = ?, nombre_completo = ?, rol = ? WHERE id = ?';
    db.query(query, [username, nombre_completo, rol, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err);
            return res.status(500).json({ message: 'Error al actualizar usuario' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    });
};

// Función para eliminar un usuario
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ message: 'Error al eliminar usuario' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    });
};
