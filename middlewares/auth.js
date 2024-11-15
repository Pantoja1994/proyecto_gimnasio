const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login.html');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario en la solicitud
        next();
    } catch (err) {
        console.error('Error en la verificación del token:', err);
        return res.redirect('/login.html');
    }
};
