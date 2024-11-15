// adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// Ruta para crear un nuevo usuario
router.post('/crear', adminUserController.createUser);

// Ruta para obtener todos los usuarios en formato de cards
router.get('/listar', adminUserController.getUsers);

// Ruta para actualizar un usuario
router.put('/actualizar/:id', adminUserController.updateUser);

// Ruta para eliminar un usuario
router.delete('/eliminar/:id', adminUserController.deleteUser);

module.exports = router;
