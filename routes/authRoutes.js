const express = require('express');
const router = express.Router();
const path = require('path');
const { loginUser, logoutUser } = require('../controllers/authController'); // Asegúrate de importar `logoutUser`

// Ruta para servir el formulario de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Ruta para procesar el inicio de sesión
router.post('/login', loginUser);

// Ruta para procesar el cierre de sesión
router.get('/logout', logoutUser); // Agrega esta ruta

module.exports = router;
