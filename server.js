const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const ingresoRoutes = require('./routes/ingresoRoutes');
const salidaRoutes = require('./routes/salidaRoutes');
const parqueaderoRoutes = require('./routes/parqueaderoRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

// Importar middlewares
const { verificarToken } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ============= MIDDLEWARES =============
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============= CONEXIÓN A BD =============
const DB_PATH = path.join(__dirname, 'parqueadero.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error de conexión a BD:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conectado a SQLite');
    }
});

global.db = db;

// ============= RUTAS =============
// RUTAS PÚBLICAS (sin autenticación)
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: '✅ API de Parqueaderos',
        endpoints: {
            auth: {
                registrar: 'POST /api/auth/registrar',
                login: 'POST /api/auth/login',
                verificarToken: 'POST /api/auth/verificar-token',
                perfil: 'GET /api/auth/perfil (requiere token)'
            }
        }
    });
});

// RUTAS PROTEGIDAS (requieren autenticación)
app.use('/api', verificarToken, parqueaderoRoutes);
app.use('/api', verificarToken, ingresoRoutes);
app.use('/api', verificarToken, salidaRoutes);
app.use('/api', verificarToken, alertaRoutes);
app.use('/api', verificarToken, reporteRoutes);

// ============= MANEJO DE ERRORES =============
app.use(errorHandler);

// ============= INICIAR SERVIDOR =============
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 Requiere autenticación (JWT)\n`);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Error:', reason);
});

module.exports = app;