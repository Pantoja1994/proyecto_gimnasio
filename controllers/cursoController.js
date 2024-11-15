// controllers/cursoController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Variable de bloqueo temporal
let isCreatingCourse = false;

// Crear un curso y guardar la imagen
const crearCurso = (req, res) => {
    if (isCreatingCourse) {
        return res.status(429).json({ error: 'La solicitud de creación de curso ya está en proceso' });
    }
    isCreatingCourse = true; // Activa el bloqueo temporal
    //console.log('req.body:', req.body);
    //console.log('req.files:', req.files);

    const { nombre, descripcion, costo, duracion } = req.body;
    let imagen_url = null;

    // Verificar si se subió una imagen
    if (req.files && req.files.imagen) {
        const imagen = req.files.imagen;
        const nombreImagen = `curso-${nombre}${path.extname(imagen.name)}`;
        const uploadPath = path.join(__dirname, '..', 'public', 'images', "CURSOS", nombreImagen);

        imagen.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error al guardar la imagen:', err);
                isCreatingCourse = false; // Libera el bloqueo si hay un error
                return res.status(500).json({ error: 'Error al subir la imagen' });
            }

            // Insertar el curso en la base de datos
            insertarCurso(nombre, descripcion, costo, duracion, `/images/CURSOS/${nombreImagen}`, res);
        });
    } else {
        insertarCurso(nombre, descripcion, costo, duracion, null, res);
    }
};

// Función auxiliar para insertar el curso en la base de datos
// Inserta el curso en la base de datos y libera el bloqueo
function insertarCurso(nombre, descripcion, costo, duracion, imagen_url, res) {
    const query = 'INSERT INTO cursos (nombre, descripcion, costo, duracion, imagen_url) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, descripcion, costo, duracion, imagen_url], (err) => {
        isCreatingCourse = false; // Libera el bloqueo después de la inserción
        if (err) {
            console.error('Error al crear el curso:', err);
            return res.status(500).json({ error: 'Error al crear el curso' });
        }
        res.status(200).json({ message: 'Curso creado exitosamente' });
    });
}


// Obtener todos los cursos
const obtenerCursos = (req, res) => {
    const query = 'SELECT * FROM cursos';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los cursos' });
        res.status(200).json(results);
    });
};

// Registrar en un curso
const registrarEnCurso = (req, res) => {
    const { curso_id, nombre_persona, telefono } = req.body;
    const query = 'INSERT INTO inscripciones_cursos (curso_id, nombre_persona, telefono) VALUES (?, ?, ?)';
    db.query(query, [curso_id, nombre_persona, telefono], (err) => {
        if (err) return res.status(500).json({ error: 'Error al registrar en el curso' });
        res.status(200).json({ message: 'Registrado exitosamente en el curso' });
    });
};

// Obtener inscripciones de un curso
const obtenerInscripcionesPorCurso = (req, res) => {
    const { curso_id } = req.params;
    const query = 'SELECT * FROM inscripciones_cursos WHERE curso_id = ?';
    db.query(query, [curso_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener inscripciones' });
        res.status(200).json(results);
    });
};

// Función para obtener un curso por ID (usada para editar)
const obtenerCursoPorId = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM cursos WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener el curso' });
        if (results.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
        res.status(200).json(results[0]);
    });
};

// Editar un curso existente y reemplazar la imagen anterior si hay una nueva
const editarCurso = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, costo, duracion } = req.body;
    let query = 'UPDATE cursos SET nombre = ?, descripcion = ?, costo = ?, duracion = ? WHERE id = ?';
    let values = [nombre, descripcion, costo, duracion, id];

    // Consultar la imagen actual
    db.query('SELECT imagen_url FROM cursos WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'Error al obtener el curso' });
        const currentImagePath = results[0].imagen_url ? path.join(__dirname, '..', 'public', results[0].imagen_url) : null;

        if (req.files && req.files.imagen) {
            const imagen = req.files.imagen;
            const nombreImagen = `curso-${nombre}${path.extname(imagen.name)}`;
            const uploadPath = path.join(__dirname, '..', 'public', 'images', 'CURSOS', nombreImagen);

            if (currentImagePath) {
                // Eliminar la imagen anterior si existe
                fs.unlink(currentImagePath, (err) => {
                    if (err) console.error('Error al eliminar la imagen anterior:', err);
                });
            }

            imagen.mv(uploadPath, (err) => {
                if (err) return res.status(500).json({ error: 'Error al subir la imagen' });

                db.query('UPDATE cursos SET imagen_url = ? WHERE id = ?', [`/images/CURSOS/${nombreImagen}`, id], (err) => {
                    if (err) return res.status(500).json({ error: 'Error al actualizar la imagen' });
                });
            });
        }

        // Ejecutar la actualización del curso
        db.query(query, values, (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar el curso' });
            res.status(200).json({ message: 'Curso actualizado exitosamente' });
        });
    });
};

// Función auxiliar para actualizar el curso en la base de datos
function actualizarCursoEnBD(nombre, descripcion, costo, duracion, imagen_url, id, res) {
    const query = 'UPDATE cursos SET nombre = ?, descripcion = ?, costo = ?, duracion = ?, imagen_url = ? WHERE id = ?';
    const values = [nombre, descripcion, costo, duracion, imagen_url, id];

    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar el curso en la base de datos:', err);
            return res.status(500).json({ error: 'Error al actualizar el curso' });
        }
        res.status(200).json({ message: 'Curso actualizado exitosamente' });
    });
}


// Función para eliminar un curso
const eliminarCurso = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM cursos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar el curso' });
        res.status(200).json({ message: 'Curso eliminado exitosamente' });
    });
};

module.exports = {
    crearCurso,
    obtenerCursos,
    obtenerCursoPorId, // Exporta esta función
    editarCurso,
    eliminarCurso,
    registrarEnCurso,
    obtenerInscripcionesPorCurso
};
