require('dotenv').config(); // Importa dotenv para cargar las variables de entorno
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

connection.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
});


module.exports = connection;
