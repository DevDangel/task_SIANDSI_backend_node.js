# Backend - Dashboard de Tareas

Backend en Node.js + Express + MySQL para el dashboard de tareas.

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**

Crea una base de datos en MySQL:
```sql
CREATE DATABASE tasks_dashboard;
```

3. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tasks_dashboard
DB_PORT=3306
PORT=5000
```

4. **Iniciar el servidor:**

Modo desarrollo (con auto-reload):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

El servidor estará corriendo en `http://localhost:5000`

## 📡 API Endpoints

### Tareas

- **GET** `/api/tareas` - Obtener todas las tareas
- **GET** `/api/tareas/:id` - Obtener tarea por ID
- **GET** `/api/tareas/buscar/:codigo` - Buscar tarea por código único
- **GET** `/api/tareas/search?q=termino` - Búsqueda general
- **POST** `/api/tareas` - Crear nueva tarea
- **PUT** `/api/tareas/:codigo` - Actualizar tarea por código único

### Ejemplo de body para crear/actualizar tarea:

```json
{
  "codigo_unico": "TASK-001",
  "titulo": "Implementar login",
  "url_tarea": "https://jira.empresa.com/TASK-001",
  "empresa": "Mi Empresa",
  "submodulo": "Autenticación",
  "rama": "feature/login",
  "hash_commit": "abc123def456"
}
```

## 📁 Estructura del Proyecto

```
backend/
├── server.js           # Servidor principal
├── database.js         # Configuración de MySQL
├── routes.js          # Rutas de la API
├── package.json       # Dependencias
├── .env.example       # Template de variables de entorno
└── README.md          # Este archivo
```

## 🗄️ Estructura de la Base de Datos

Tabla `tareas`:
- `id` - INT (Primary Key, Auto Increment)
- `codigo_unico` - VARCHAR(100) (Unique)
- `titulo` - VARCHAR(255)
- `url_tarea` - VARCHAR(500)
- `empresa` - VARCHAR(255)
- `submodulo` - VARCHAR(255)
- `rama` - VARCHAR(255)
- `hash_commit` - VARCHAR(255)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## ✅ Verificar que funciona

Abre tu navegador en `http://localhost:5000` y deberías ver:
```json
{
  "message": "API de Dashboard de Tareas funcionando ✅"
}
```
