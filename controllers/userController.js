const db = require('../config/db');
const { sendWhatsAppMessage } = require('../utils/whatsappAPI');

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?\d{10,15}$/; // Expresión regular para validar el formato de número
    return phoneRegex.test(phone);
};

const registerUser = async (req, res) => {
    try {
        const { nombre, edad, genero, peso, altura, diasActividad, tipoActividad, objetivo, telefono, retoSeleccionado } = req.body;

        if (!isValidPhoneNumber(telefono)) {
            return res.status(400).json({ error: 'Número de teléfono no es válido. Debe ser en formato internacional.' });
        }

        // Guardar en la base de datos
        const query = `INSERT INTO usuarios (nombre, edad, genero, peso, altura, diasActividad, tipoActividad, objetivo, telefono, retoSeleccionado) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [nombre, edad, genero, peso, altura, diasActividad, tipoActividad, objetivo, telefono, retoSeleccionado], (err, result) => {
            if (err) {
                console.error('Error al registrar al usuario:', err);
                return res.status(500).json({ error: 'Error al registrar al usuario' });
            }

            // Enviar mensaje de bienvenida
            try {
                const message = `¡Hola ${nombre}! Bienvenido al reto. Un especialista se pondrá en contacto en 1-2 días.`;
                sendWhatsAppMessage(telefono, message);
                console.log('Mensaje de WhatsApp enviado con éxito');
                res.status(200).json({ message: 'Usuario registrado y mensaje enviado' });
            } catch (twilioError) {
                console.error('Error al enviar mensaje de WhatsApp:', twilioError);
                res.status(500).json({ error: 'Usuario registrado, pero no se pudo enviar mensaje de WhatsApp' });
            }
        });
    } catch (error) {
        console.error('Error en el registro del usuario:', error);
        res.status(500).json({ error: 'Error en el registro del usuario' });
    }
};

// Define la función getUsersDashboard
const getUsersDashboard = (req, res) => {
    const query = 'SELECT * FROM usuarios';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener los usuarios' });
        }

        res.status(200).json(results);
    });
};

module.exports = { registerUser, getUsersDashboard };
