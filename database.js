const mysql = require('mysql2');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tasks_dashboard',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

if (pool){
  console.log('✅ Conexión a la base de datos establecida exitosamente');
}



// Usar promesas
const promisePool = pool.promise();

// Crear tabla si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_unico VARCHAR(100) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    url_tarea VARCHAR(500),
    empresa VARCHAR(255),
    submodulo VARCHAR(255),
    rama VARCHAR(255),
    hash_commit VARCHAR(255),
    id_estado INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
  )
`;

const createEstadosTableQuery = `
  CREATE TABLE IF NOT EXISTS estado (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nom_estado VARCHAR(100) NOT NULL
  )
`;

const createNotasTableQuery = `
  CREATE TABLE IF NOT EXISTS notas (
    id_notas INT AUTO_INCREMENT PRIMARY KEY,
    nota_desc TEXT,
    id_tarea INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id) ON DELETE CASCADE
  )
`;

const createUsuariosTableQuery = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`;

// Inicializar base de datos
const initDB = async () => {
  try {
    await promisePool.query(createTableQuery);
    console.log('✅ Tabla "tareas" verificada/creada exitosamente');
    await promisePool.query(createEstadosTableQuery);
    console.log('✅ Tabla "estados" verificada/creada exitosamente');
    await promisePool.query(createNotasTableQuery);
    console.log('✅ Tabla "notas" verificada/creada exitosamente');    await promisePool.query(createUsuariosTableQuery);
    console.log('✅ Tabla "usuarios" verificada/creada exitosamente');  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

module.exports = { pool: promisePool, initDB };
