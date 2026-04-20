const mysql = require('mysql2');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tasks',
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
    FOREIGN KEY (id_estado) REFERENCES estado(id_estado)
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

const ensureTareasEstadoCompatibility = async () => {
  const [idEstadoColumn] = await promisePool.query("SHOW COLUMNS FROM tareas LIKE 'id_estado'");
  const [estadoColumn] = await promisePool.query("SHOW COLUMNS FROM tareas LIKE 'estado'");

  if (idEstadoColumn.length === 0) {
    await promisePool.query('ALTER TABLE tareas ADD COLUMN id_estado INT NULL');
    console.log('ℹ️ Columna "id_estado" agregada en "tareas"');
  }

  if (estadoColumn.length > 0) {
    await promisePool.query('UPDATE tareas SET id_estado = estado WHERE id_estado IS NULL');
    console.log('ℹ️ Datos migrados de "estado" a "id_estado" en "tareas"');
  }

  try {
    const [foreignKeyRows] = await promisePool.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tareas'
        AND COLUMN_NAME = 'id_estado'
        AND REFERENCED_TABLE_NAME = 'estado'
    `);

    if (foreignKeyRows.length === 0) {
      await promisePool.query(
        'ALTER TABLE tareas ADD CONSTRAINT fk_tareas_estado FOREIGN KEY (id_estado) REFERENCES estado(id_estado)'
      );
      console.log('ℹ️ Foreign key fk_tareas_estado agregada');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo crear/validar FK de id_estado:', error.message);
  }
};

// Inicializar base de datos
const initDB = async () => {
  try {
    await promisePool.query(createEstadosTableQuery);
    console.log('✅ Tabla "estado" verificada/creada exitosamente');
    await promisePool.query(createTableQuery);
    console.log('✅ Tabla "tareas" verificada/creada exitosamente');
    await ensureTareasEstadoCompatibility();
    await promisePool.query(createNotasTableQuery);
    console.log('✅ Tabla "notas" verificada/creada exitosamente');
    await promisePool.query(createUsuariosTableQuery);
    console.log('✅ Tabla "usuarios" verificada/creada exitosamente');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

module.exports = { pool: promisePool, initDB };
