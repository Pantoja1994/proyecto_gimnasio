// userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, getUsersDashboard } = require('../controllers/userController');
const { loginUser } = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

// Asegúrate de que todas las funciones están definidas y correctamente importadas
if (!dashboardController.getUsers || !dashboardController.getUsersForCards || !dashboardController.uploadPhoto || !dashboardController.deleteUser) {
    console.error('Error: Alguna función no está definida en dashboardController');
}

// Rutas
router.post('/register', registerUser); // Ruta para registrar usuario
router.get('/dashboard', getUsersDashboard); // Ruta para el dashboard de usuarios
router.post('/login', loginUser); // Ruta para iniciar sesión
router.get('/dashboard/users', dashboardController.getUsers); // Ruta para obtener los datos del dashboard
router.get('/cards', dashboardController.getUsersForCards); // Ruta para obtener los usuarios en formato de cards
router.post('/:userId/upload', dashboardController.uploadPhoto); // Ruta para subir las fotos del usuario
router.delete('/:id', dashboardController.deleteUser); // Ruta para eliminar un usuario

module.exports = router;
