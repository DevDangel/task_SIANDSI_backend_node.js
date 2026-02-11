const express = require('express');
const router = express.Router();
const { pool } = require('./database');

// Obtener todas las tareas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tareas ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Buscar tarea por código único
router.get('/buscar/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM tareas WHERE codigo_unico = ?',
      [codigo]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al buscar tarea:', error);
    res.status(500).json({ error: 'Error al buscar tarea' });
  }
});

// Buscar tareas (búsqueda general)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const [rows] = await pool.query(
      `SELECT * FROM tareas 
       WHERE codigo_unico LIKE ? 
       OR titulo LIKE ? 
       ORDER BY created_at DESC`,
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// Crear nueva tarea
router.post('/', async (req, res) => {
  try {
    const { codigo_unico, titulo, url_tarea, empresa, submodulo, rama, hash_commit } = req.body;
    
    // Validar campos requeridos
    if (!codigo_unico || !titulo) {
      return res.status(400).json({ error: 'Código único y título son requeridos' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO tareas (codigo_unico, titulo, url_tarea, empresa, submodulo, rama, hash_commit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo_unico, titulo, url_tarea, empresa, submodulo, rama, hash_commit]
    );
    
    res.status(201).json({
      message: 'Tarea creada exitosamente',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El código único ya existe' });
    }
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Actualizar tarea
router.put('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { titulo, url_tarea, empresa, submodulo, rama, hash_commit } = req.body;
    
    const [result] = await pool.query(
      `UPDATE tareas 
       SET titulo = ?, url_tarea = ?, empresa = ?, submodulo = ?, rama = ?, hash_commit = ?
       WHERE codigo_unico = ?`,
      [titulo, url_tarea, empresa, submodulo, rama, hash_commit, codigo]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Obtener tarea por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tareas WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
});

module.exports = router;
