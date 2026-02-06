const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, '../parqueadero.db');

// Crear o conectar a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Conectado a SQLite: ' + DB_PATH);
  }
});

// Ejecutar SQL de forma síncrona
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Función para crear todas las tablas
const crearTablas = async () => {
  try {
    console.log('🔄 Creando tablas de la base de datos...\n');

    // Tabla de Usuarios
    await runAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        telefono TEXT,
        placa_vehiculo TEXT,
        tipo_vehiculo TEXT DEFAULT 'auto',
        rol TEXT DEFAULT 'usuario',
        activo INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla: usuarios');

    // Tabla de Parqueaderos
    await runAsync(`
      CREATE TABLE IF NOT EXISTS parqueaderos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ubicacion TEXT NOT NULL,
        ciudad TEXT,
        capacidad_total INTEGER NOT NULL,
        capacidad_autos INTEGER NOT NULL,
        capacidad_motos INTEGER NOT NULL,
        descripcion TEXT,
        telefono TEXT,
        email TEXT,
        tarifa_auto_por_hora DECIMAL(10, 2) DEFAULT 5.00,
        tarifa_moto_por_hora DECIMAL(10, 2) DEFAULT 2.50,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla: parqueaderos');

    // Tabla de Espacios de Parqueo
    await runAsync(`
      CREATE TABLE IF NOT EXISTS espacios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parqueadero_id INTEGER NOT NULL,
        numero TEXT NOT NULL,
        tipo_vehiculo TEXT NOT NULL,
        estado TEXT DEFAULT 'disponible',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parqueadero_id) REFERENCES parqueaderos(id),
        UNIQUE(parqueadero_id, numero)
      )
    `);
    console.log('✅ Tabla: espacios');

    // Tabla de Ingresos (Entrada de vehículos)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS ingresos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        parqueadero_id INTEGER NOT NULL,
        espacio_id INTEGER NOT NULL,
        tipo_vehiculo TEXT NOT NULL,
        placa_vehiculo TEXT NOT NULL,
        hora_entrada DATETIME NOT NULL,
        foto_entrada TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (parqueadero_id) REFERENCES parqueaderos(id),
        FOREIGN KEY (espacio_id) REFERENCES espacios(id)
      )
    `);
    console.log('✅ Tabla: ingresos');

    // Tabla de Salidas (Salida de vehículos)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS salidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingreso_id INTEGER NOT NULL,
        usuario_id INTEGER,
        parqueadero_id INTEGER NOT NULL,
        espacio_id INTEGER NOT NULL,
        hora_salida DATETIME NOT NULL,
        tiempo_parqueo_minutos INTEGER,
        costo_total DECIMAL(10, 2),
        metodo_pago TEXT DEFAULT 'efectivo',
        foto_salida TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingreso_id) REFERENCES ingresos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (parqueadero_id) REFERENCES parqueaderos(id),
        FOREIGN KEY (espacio_id) REFERENCES espacios(id)
      )
    `);
    console.log('✅ Tabla: salidas');

    // Tabla de Cascos (Control de cascos de motos)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS cascos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingreso_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        estado TEXT DEFAULT 'entregado',
        descripcion TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingreso_id) REFERENCES ingresos(id)
      )
    `);
    console.log('✅ Tabla: cascos');

    // Tabla de Alertas
    await runAsync(`
      CREATE TABLE IF NOT EXISTS alertas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        ingreso_id INTEGER,
        usuario_id INTEGER,
        parqueadero_id INTEGER,
        estado TEXT DEFAULT 'activa',
        prioridad TEXT DEFAULT 'media',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingreso_id) REFERENCES ingresos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (parqueadero_id) REFERENCES parqueaderos(id)
      )
    `);
    console.log('✅ Tabla: alertas');

    // Tabla de Reportes
    await runAsync(`
      CREATE TABLE IF NOT EXISTS reportes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parqueadero_id INTEGER NOT NULL,
        fecha_reporte DATE NOT NULL,
        total_ingresos INTEGER DEFAULT 0,
        total_salidas INTEGER DEFAULT 0,
        ingresos_autos INTEGER DEFAULT 0,
        ingresos_motos INTEGER DEFAULT 0,
        capacidad_promedio_autos DECIMAL(5, 2),
        capacidad_promedio_motos DECIMAL(5, 2),
        ganancia_total DECIMAL(10, 2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parqueadero_id) REFERENCES parqueaderos(id)
      )
    `);
    console.log('✅ Tabla: reportes');

    // ... código anterior ...

// ============= TABLA USUARIOS =============
const sqlUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'operador', -- admin, operador
        estado TEXT DEFAULT 'activo', -- activo, inactivo
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// ... resto de tablas ...

    // Índices para optimizar búsquedas
    await runAsync('CREATE INDEX IF NOT EXISTS idx_ingresos_placa ON ingresos(placa_vehiculo)');
    await runAsync('CREATE INDEX IF NOT EXISTS idx_ingresos_parqueadero ON ingresos(parqueadero_id)');
    await runAsync('CREATE INDEX IF NOT EXISTS idx_ingresos_usuario ON ingresos(usuario_id)');
    await runAsync('CREATE INDEX IF NOT EXISTS idx_salidas_ingreso ON salidas(ingreso_id)');
    await runAsync('CREATE INDEX IF NOT EXISTS idx_alertas_parqueadero ON alertas(parqueadero_id)');
    console.log('✅ Índices creados');

    console.log('\n✅ ¡Base de datos inicializada correctamente!\n');
    return true;

  } catch (error) {
    console.error('❌ Error al crear las tablas:', error.message);
    return false;
  }
};

// Función para insertar datos de prueba
const inserirDatosPrueba = async () => {
  try {
    console.log('🔄 Insertando datos de prueba...\n');

    // Insertar parqueadero de prueba
    await runAsync(`
      INSERT OR IGNORE INTO parqueaderos 
      (nombre, ubicacion, ciudad, capacidad_total, capacidad_autos, capacidad_motos, 
       descripcion, tarifa_auto_por_hora, tarifa_moto_por_hora)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Parqueadero Central', 'Calle 10 # 5-20', 'Bogotá', 100, 80, 20, 
        'Parqueadero céntrico con vigilancia 24/7', 5.00, 2.50]);
    console.log('✅ Parqueadero de prueba insertado');

    // Insertar espacios de prueba para autos
    for (let i = 1; i <= 10; i++) {
      await runAsync(`
        INSERT OR IGNORE INTO espacios (parqueadero_id, numero, tipo_vehiculo, estado)
        VALUES (?, ?, ?, ?)
      `, [1, `A${i}`, 'auto', 'disponible']);
    }
    console.log('✅ 10 espacios para autos insertados');

    // Insertar espacios de prueba para motos
    for (let i = 1; i <= 5; i++) {
      await runAsync(`
        INSERT OR IGNORE INTO espacios (parqueadero_id, numero, tipo_vehiculo, estado)
        VALUES (?, ?, ?, ?)
      `, [1, `M${i}`, 'moto', 'disponible']);
    }
    console.log('✅ 5 espacios para motos insertados');

    // Insertar usuario de prueba
    await runAsync(`
      INSERT OR IGNORE INTO usuarios 
      (nombre, email, password, telefono, placa_vehiculo, tipo_vehiculo, rol)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Juan Pérez', 'juan@example.com', 'password123', '3001234567', 'ABC123', 'auto', 'usuario']);
    console.log('✅ Usuario de prueba insertado');

    console.log('\n✅ Datos de prueba insertados correctamente!\n');

  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error.message);
  }
};

// Inicializar base de datos
const inicializarBD = async () => {
  const tablasCreadas = await crearTablas();
  if (tablasCreadas) {
    await inserirDatosPrueba();
  }
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la BD:', err.message);
    } else {
      console.log('Conexión a la BD cerrada.');
    }
  });
};

// Ejecutar
inicializarBD();

module.exports = db;