// routes/cursoRoutes.js
const express = require('express');
const router = express.Router();
const { crearCurso, obtenerCursos, registrarEnCurso, obtenerInscripcionesPorCurso, eliminarCurso, editarCurso, obtenerCursoPorId } = require('../controllers/cursoController');

// Ruta para crear un curso
router.post('/crear', crearCurso);

// Ruta para obtener todos los cursos
router.get('/obtener', obtenerCursos);

// routes/cursoRoutes.js
router.get('/:id', obtenerCursoPorId); // GET para obtener los datos de un curso

// Ruta para obtener un curso específico por ID para editar
router.put('/:id', editarCurso); // PUT para obtener datos de un curso

// Ruta para actualizar un curso específico
//router.put('/:id', editarCurso); // PUT para actualizar el curso

// Ruta para eliminar un curso
router.delete('/:id', eliminarCurso); // DELETE para eliminar el curso

// Ruta para registrar un usuario en un curso
router.post('/registrar', registrarEnCurso);

// Ruta para obtener inscripciones de un curso específico
router.get('/inscripciones/:curso_id', obtenerInscripcionesPorCurso);

module.exports = router;
