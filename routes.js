const express = require('express');
const router = express.Router();
const { pool } = require('./database');

// Obtener todas las tareas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, e.nom_estado 
      FROM tareas t 
      LEFT JOIN estado e ON t.estado = e.id_estado 
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Obtener todos los estados
router.get('/estados', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estado ORDER BY id_estado ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estados:', error);
    res.status(500).json({ error: 'Error al obtener estados' });
  }
});

// Buscar tarea por código único
router.get('/buscar/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await pool.query(
      `SELECT t.*, e.nom_estado 
       FROM tareas t 
       LEFT JOIN estado e ON t.estado = e.id_estado 
       WHERE t.codigo_unico = ?`,
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
      `SELECT t.*, e.nom_estado 
       FROM tareas t 
       LEFT JOIN estado e ON t.estado = e.id_estado 
       WHERE t.codigo_unico LIKE ? 
       OR t.titulo LIKE ? 
       ORDER BY t.created_at DESC`,
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
    const { codigo_unico, titulo, url_tarea, empresa, submodulo, rama, estado, hash_commit } = req.body;
    
    // Validar campos requeridos
    if (!codigo_unico || !titulo) {
      return res.status(400).json({ error: 'Código único y título son requeridos' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO tareas (codigo_unico, titulo, url_tarea, empresa, submodulo, rama, estado, hash_commit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_unico, titulo, url_tarea, empresa, submodulo, rama, estado, hash_commit]
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
    const { titulo, url_tarea, empresa, submodulo, rama, estado, hash_commit } = req.body;
    
    const [result] = await pool.query(
      `UPDATE tareas 
       SET titulo = ?, url_tarea = ?, empresa = ?, submodulo = ?, rama = ?, estado = ?, hash_commit = ?
       WHERE codigo_unico = ?`,
      [titulo, url_tarea, empresa, submodulo, rama, estado, hash_commit, codigo]
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

// Obtener notas de una tarea
router.get('/:id_tarea/notas', async (req, res) => {
  try {
    const { id_tarea } = req.params;
    const [rows] = await pool.query('SELECT * FROM notas WHERE id_tarea = ? ORDER BY created_at DESC', [id_tarea]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

// Crear o actualizar nota de una tarea
router.post('/:id_tarea/notas', async (req, res) => {
  try {
    const { id_tarea } = req.params;
    const { nota_desc } = req.body;

    // Verificar si ya existe una nota para esta tarea
    const [existing] = await pool.query('SELECT id_notas FROM notas WHERE id_tarea = ?', [id_tarea]);

    if (existing.length > 0) {
      // Actualizar
      await pool.query('UPDATE notas SET nota_desc = ? WHERE id_tarea = ?', [nota_desc, id_tarea]);
      res.json({ message: 'Nota actualizada exitosamente' });
    } else {
      // Insertar
      await pool.query('INSERT INTO notas (nota_desc, id_tarea) VALUES (?, ?)', [nota_desc, id_tarea]);
      res.json({ message: 'Nota creada exitosamente' });
    }
  } catch (error) {
    console.error('Error al guardar nota:', error);
    res.status(500).json({ error: 'Error al guardar nota' });
  }
});

module.exports = router;
