const mysql = require('mysql2');
require('dotenv').config();

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// Inicializar base de datos
const initDB = async () => {
  try {
    await promisePool.query(createTableQuery);
    console.log('✅ Tabla "tareas" verificada/creada exitosamente');
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
    throw error;
  }
};

module.exports = { pool: promisePool, initDB };
