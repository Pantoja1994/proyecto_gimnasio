const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies['token']; // Busca el token en las cookies como 'token'
    console.log('Token recibido:', token);

    if (!token) {
        console.log('Token no encontrado. Redirigiendo a login.');
        return res.redirect('/login.html'); // Redirigir a login si no hay token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token inválido o expirado:', err);
            return res.redirect('/login.html'); // Redirige si el token es inválido o ha expirado
        }

        req.user = decoded; // Guarda la información del usuario en la solicitud
        console.log('Token válido. Usuario autenticado.');
        next();
    });
};

module.exports = authMiddleware;
