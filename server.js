const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initDB } = require('./database');
const tasksRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['https://task-siandsi-frontend-react.vercel.app/', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/tareas', tasksRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Dashboard de Tareas funcionando ✅' });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api/tareas`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
