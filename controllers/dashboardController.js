// dashboardController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { stringify } = require('csv-stringify');
//dconst db = require('../config/db');


// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Carpeta de destino para las fotos
    },
    filename: (req, file, cb) => {
        const userId = req.params.userId;
        const fileType = file.fieldname === 'fotoAntes' ? 'fotoAntes' : 'fotoDespues';
        cb(null, `${fileType}-${userId}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Obtener todos los usuarios para el dashboard
const getUsers = (req, res) => {
    db.query('SELECT * FROM usuarios', (error, results) => {
        if (error) {
            console.error("Error obteniendo usuarios:", error);
            res.status(500).json({ error: 'Error obteniendo usuarios' });
        } else {
            res.json(results);
        }
    });
};

// Obtener todos los usuarios para mostrarlos en cards con sus fotos
// Obtener todos los usuarios para mostrarlos en cards con sus fotos
const getUsersForCards = (req, res) => {
    const query = `
        SELECT id, nombre, edad, genero, peso, altura,
               objetivo, telefono, retoSeleccionado,
               foto_antes, foto_despues
        FROM usuarios
    `;
    
    db.query(query, (error, results) => {
        if (error) {
            console.error("Error obteniendo usuarios para cards:", error);
            res.status(500).json({ error: 'Error obteniendo usuarios para cards' });
        } else {
            // No necesitas añadir "uploads/" ya que las rutas están completas en la base de datos
            res.json(results);
        }
    });
};


// Subir fotos del usuario (antes y después)
const uploadPhoto = (req, res) => {
    const userId = req.params.userId;
    let fotoAntesPath = null;
    let fotoDespuesPath = null;

    // Consulta para obtener las rutas actuales de las fotos en la base de datos
    const getCurrentPhotosQuery = 'SELECT foto_antes, foto_despues FROM usuarios WHERE id = ?';

    db.query(getCurrentPhotosQuery, [userId], (err, results) => {
        if (err) {
            console.error("Error obteniendo las rutas actuales de las fotos:", err);
            return res.status(500).json({ error: 'Error al obtener las rutas actuales de las fotos' });
        }

        const currentPhotoPaths = results[0];

        // Manejo de la foto del antes
        if (req.files && req.files.fotoAntes) {
            fotoAntesPath = `uploads/fotoAntes_${userId}${path.extname(req.files.fotoAntes.name)}`;

            // Elimina la foto anterior si existe
            if (currentPhotoPaths.foto_antes) {
                const oldFotoAntesPath = path.join(__dirname, '..', 'public', currentPhotoPaths.foto_antes);
                fs.unlink(oldFotoAntesPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error al eliminar la foto anterior del antes:', unlinkErr);
                });
            }

            // Mueve la nueva foto del antes
            req.files.fotoAntes.mv(path.join(__dirname, '..', 'public', fotoAntesPath), (err) => {
                if (err) {
                    console.error('Error al subir la nueva foto del antes:', err);
                    return res.status(500).json({ error: 'Error al subir la nueva foto del antes' });
                }
            });
        }

        // Manejo de la foto del después
        if (req.files && req.files.fotoDespues) {
            fotoDespuesPath = `uploads/fotoDespues_${userId}${path.extname(req.files.fotoDespues.name)}`;

            // Elimina la foto anterior si existe
            if (currentPhotoPaths.foto_despues) {
                const oldFotoDespuesPath = path.join(__dirname, '..', 'public', currentPhotoPaths.foto_despues);
                fs.unlink(oldFotoDespuesPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error al eliminar la foto anterior del después:', unlinkErr);
                });
            }

            // Mueve la nueva foto del después
            req.files.fotoDespues.mv(path.join(__dirname, '..', 'public', fotoDespuesPath), (err) => {
                if (err) {
                    console.error('Error al subir la nueva foto del después:', err);
                    return res.status(500).json({ error: 'Error al subir la nueva foto del después' });
                }
            });
        }

        // Construye la consulta de actualización dinámica
        let query = 'UPDATE usuarios SET ';
        const values = [];

        if (fotoAntesPath) {
            query += 'foto_antes = ?, ';
            values.push(fotoAntesPath);
        }

        if (fotoDespuesPath) {
            query += 'foto_despues = ?, ';
            values.push(fotoDespuesPath);
        }

        // Elimina la última coma y agrega la condición WHERE
        query = query.slice(0, -2) + ' WHERE id = ?';
        values.push(userId);

        // Ejecuta la actualización solo con los campos que tienen una nueva imagen
        db.query(query, values, (error) => {
            if (error) {
                console.error("Error al actualizar la ruta de las fotos en la base de datos:", error);
                return res.status(500).json({ error: 'Error al guardar las rutas de las fotos en la base de datos' });
            }
            res.json({ message: 'Fotos subidas y rutas guardadas exitosamente' });
        });
    });
};


// Eliminar usuario
const deleteUser = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            res.status(500).json({ error: 'Error al eliminar usuario' });
        } else {
            res.json({ message: 'Usuario eliminado correctamente' });
        }
    });
};

const getEstadisticas = (req, res) => {
    const { tipoReto, edadMinima, edadMaxima, genero } = req.body;

    // Consulta para obtener total de inscripciones
    let queryTotalInscripciones = `
        SELECT COUNT(*) AS total, c.nombre AS curso
        FROM inscripciones_cursos ic
        JOIN cursos c ON ic.curso_id = c.id
        WHERE 1=1
    `;

    if (tipoReto) queryTotalInscripciones += ` AND ic.curso_id = ${db.escape(tipoReto)}`;
    if (edadMinima) queryTotalInscripciones += ` AND ic.edad >= ${db.escape(edadMinima)}`;
    if (edadMaxima) queryTotalInscripciones += ` AND ic.edad <= ${db.escape(edadMaxima)}`;
    if (genero) queryTotalInscripciones += ` AND ic.genero = ${db.escape(genero)}`;

    queryTotalInscripciones += ' GROUP BY ic.curso_id';

    // Consulta para obtener la edad promedio
    let queryEdadPromedio = `
        SELECT AVG(ic.edad) AS edad_promedio, c.nombre AS curso
        FROM inscripciones_cursos ic
        JOIN cursos c ON ic.curso_id = c.id
        WHERE 1=1
    `;

    if (tipoReto) queryEdadPromedio += ` AND ic.curso_id = ${db.escape(tipoReto)}`;
    if (edadMinima) queryEdadPromedio += ` AND ic.edad >= ${db.escape(edadMinima)}`;
    if (edadMaxima) queryEdadPromedio += ` AND ic.edad <= ${db.escape(edadMaxima)}`;
    if (genero) queryEdadPromedio += ` AND ic.genero = ${db.escape(genero)}`;

    queryEdadPromedio += ' GROUP BY ic.curso_id';

    // Consulta para obtener la distribución de género
    let queryGeneroDistribucion = `
        SELECT ic.genero, COUNT(*) AS cantidad, c.nombre AS curso
        FROM inscripciones_cursos ic
        JOIN cursos c ON ic.curso_id = c.id
        WHERE 1=1
    `;

    if (tipoReto) queryGeneroDistribucion += ` AND ic.curso_id = ${db.escape(tipoReto)}`;
    if (edadMinima) queryGeneroDistribucion += ` AND ic.edad >= ${db.escape(edadMinima)}`;
    if (edadMaxima) queryGeneroDistribucion += ` AND ic.edad <= ${db.escape(edadMaxima)}`;
    if (genero) queryGeneroDistribucion += ` AND ic.genero = ${db.escape(genero)}`;

    queryGeneroDistribucion += ' GROUP BY ic.curso_id, ic.genero';

    // Ejecuta las consultas en secuencia
    db.query(queryTotalInscripciones, (error, inscripciones) => {
        if (error) return res.status(500).json({ error: 'Error al obtener estadísticas de inscripciones' });

        db.query(queryEdadPromedio, (error, edades) => {
            if (error) return res.status(500).json({ error: 'Error al obtener estadísticas de edad promedio' });

            db.query(queryGeneroDistribucion, (error, generoDistribucion) => {
                if (error) return res.status(500).json({ error: 'Error al obtener estadísticas de género' });
                
                /*console.log({
                    inscripciones,
                    edades,
                    generoDistribucion
                });*/
                // Envía los tres conjuntos de datos en un solo objeto JSON
                res.json({
                    inscripciones,
                    edades,
                    generoDistribucion
                });
            });
        });
    });
};


const getEstadisticasCSV = (req, res) => {
    const { tipoReto, edadMinima, edadMaxima, genero } = req.body;

    let query = `
        SELECT COUNT(*) AS total, c.nombre AS curso
        FROM inscripciones_cursos ic
        JOIN cursos c ON ic.curso_id = c.id
        WHERE 1=1
    `;

    if (tipoReto) query += ` AND ic.curso_id = ${db.escape(tipoReto)}`;
    if (edadMinima) query += ` AND ic.edad >= ${db.escape(edadMinima)}`;
    if (edadMaxima) query += ` AND ic.edad <= ${db.escape(edadMaxima)}`;
    if (genero) query += ` AND ic.genero = ${db.escape(genero)}`;

    query += ' GROUP BY ic.curso_id';

    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Error al generar el reporte' });

        // Convertir los resultados a CSV
        const csvData = [];
        csvData.push(['Curso', 'Total Inscripciones']);
        results.forEach(row => {
            csvData.push([row.curso, row.total]);
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_estadisticas.csv"');

        stringify(csvData, { header: false }).pipe(res);
    });
};



// Exportar todas las funciones
module.exports = {
    getUsers,
    getUsersForCards,
    uploadPhoto,
    deleteUser,
    getEstadisticas,
    getEstadisticasCSV
};
