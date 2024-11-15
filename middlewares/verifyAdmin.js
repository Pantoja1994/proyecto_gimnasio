// middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
    const token = req.cookies.token; // O cualquier mecanismo que uses para pasar el token
    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder' });
        }
        req.user = decoded; // Agregar el usuario al request para usarlo más tarde
        next(); // Continuar con la siguiente función/método
    });
}

module.exports = verifyAdmin;
