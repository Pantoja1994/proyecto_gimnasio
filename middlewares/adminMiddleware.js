// middlewares/adminMiddleware.js
module.exports = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
        next(); // El usuario es administrador, continuar
    } else {
        res.status(403).json({ message: 'Acceso denegado. Requiere rol de Administrador.' });
    }
};
