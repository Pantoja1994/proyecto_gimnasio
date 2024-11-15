// routes/configurationRoutes.js
const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin'); // Importar el middleware

// Ruta para acceder a la configuración (solo para administradores)
router.get('/configuracion', verifyAdmin, (req, res) => {
    // Aquí se mostrará la interfaz de configuración de usuarios.
    res.render('configuracion');
});

// Ruta para dar de alta a un nuevo usuario
router.post('/create-user', verifyAdmin, (req, res) => {
    // Crear un nuevo usuario desde el formulario
    const { username, password, nombre_completo, role } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error al crear el usuario' });
        
        const sql = 'INSERT INTO users (username, password, nombre_completo, role) VALUES (?, ?, ?, ?)';
        db.query(sql, [username, hash, nombre_completo, role], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al insertar el usuario' });
            res.status(200).json({ message: 'Usuario creado exitosamente' });
        });
    });
});

// Ruta para modificar los datos de un usuario
router.put('/edit-user/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { nombre_completo, role } = req.body;
    
    const sql = 'UPDATE users SET nombre_completo = ?, role = ? WHERE id = ?';
    db.query(sql, [nombre_completo, role, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar el usuario' });
        res.status(200).json({ message: 'Usuario actualizado correctamente' });
    });
});

module.exports = router;
