// routes/estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const dashboardController = require('../controllers/dashboardController');

router.post('/filtrar', dashboardController.getEstadisticas);
// Ruta para generar el reporte en CSV
//router.post('/estadisticas/reporte-csv', dashboardController.getEstadisticasCSV);
router.post('/reporte-csv', dashboardController.getEstadisticasCSV);

module.exports = router;

/* Endpoint para filtrar estadísticas
router.post('/filtrar', (req, res) => {
    const { tipoReto, edadMinima, edadMaxima, genero } = req.body;

    console.log("Datos recibidos en el backend:", { tipoReto, edadMinima, edadMaxima, genero });

    // Construir la consulta SQL basada en los filtros
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

    console.log("Query ejecutada:", query);

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener estadísticas:', error);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        console.log("Resultados obtenidos:", results);
        res.json(results);
    });
});*/


