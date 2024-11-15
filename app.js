require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// Importar middlewares y rutas
const authMiddleware = require('./middlewares/authMiddleware');
const adminMiddleware = require('./middlewares/adminMiddleware');
const adminUserRoutes = require('./routes/adminUserRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const { registerUser } = require('./controllers/userController');

const app = express();

// Configuración de middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware para manejar archivos
app.use(fileUpload()); // Configuración original, sin opciones adicionales

//Ruta para manejar las subidas de imagenes
app.use('/uploads', express.static('public/uploads'));

// Rutas para manejar cursos
app.use('/api/cursos', cursoRoutes);

// Rutas de autenticación (sin protección)
app.use('/api', authRoutes);
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Ruta pública para `retos.html`
app.get('/retos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'retos.html'));
});
app.post('/api/register', registerUser);

// Rutas protegidas con el middleware de autenticación
app.get('/dashboard.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.use('/api/users', userRoutes);
//sI DEJA de funcionar la api de whatsapp volver a poner esta linea : app.use('/api/users', authMiddleware, userRoutes);

// Protege la ruta con autenticación y autorización de administrador
app.use('/api/admin-users', authMiddleware, adminMiddleware, adminUserRoutes);

//Ruta para las estadisticas
app.use('/api/estadisticas', estadisticasRoutes);


// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
