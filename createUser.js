const bcrypt = require('bcrypt');
const db = require('./config/db');

//Variables para crear sesiones
const username = 'admin3';
const plainPassword = '1234';
const nombreCompleto = 'Paulo Gonzalez';
const rol = 'administrador'; // Cambiar a 'usuario' si se quiere crear un usuario regular

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err;

  const sql = 'INSERT INTO users (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, hash, nombreCompleto, rol], (err, result) => {
    if (err) throw err;
    console.log('Usuario insertado correctamente');
    process.exit();
  });
});
