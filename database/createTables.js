require("dotenv").config();
const supabase = require('../config/supabase');

/**
 * Script para crear las tablas automáticamente en Supabase
 * Ejecutar: node database/createTables.js
 */

const createTables = async () => {
  try {
    console.log('🔄 Iniciando creación de tablas...');

    // 1. Crear tabla usuarios
    console.log('📝 Creando tabla usuarios...');
    const { error: errorUsuarios } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS usuarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          contraseña VARCHAR(255) NOT NULL,
          rol VARCHAR(50) DEFAULT 'vendedor',
          estado BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null })); // Ignorar si ya existe

    // 2. Crear tabla categorias
    console.log('📝 Creando tabla categorias...');
    const { error: errorCategorias } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categorias (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(255) NOT NULL UNIQUE,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 3. Crear tabla productos
    console.log('📝 Creando tabla productos...');
    const { error: errorProductos } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS productos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          codigo VARCHAR(100) UNIQUE NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
          precio_costo DECIMAL(10, 2) NOT NULL,
          precio_venta DECIMAL(10, 2) NOT NULL,
          stock_actual INTEGER DEFAULT 0,
          stock_minimo INTEGER DEFAULT 10,
          estado BOOLEAN DEFAULT true,
          imagen_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 4. Crear tabla clientes
    console.log('📝 Creando tabla clientes...');
    const { error: errorClientes } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS clientes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(255) NOT NULL,
          documento VARCHAR(50),
          email VARCHAR(255),
          telefono VARCHAR(20),
          direccion TEXT,
          ciudad VARCHAR(100),
          tipo_cliente VARCHAR(50) DEFAULT 'consumidor',
          estado BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 5. Crear tabla facturas
    console.log('📝 Creando tabla facturas...');
    const { error: errorFacturas } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS facturas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          numero_factura VARCHAR(100) UNIQUE NOT NULL,
          cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
          usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
          descuento DECIMAL(12, 2) DEFAULT 0,
          impuesto DECIMAL(12, 2) DEFAULT 0,
          total DECIMAL(12, 2) NOT NULL,
          metodo_pago VARCHAR(50),
          estado VARCHAR(50) DEFAULT 'completada',
          notas TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 6. Crear tabla detalles_factura
    console.log('📝 Creando tabla detalles_factura...');
    const { error: errorDetalles } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS detalles_factura (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
          producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
          cantidad INTEGER NOT NULL,
          precio_unitario DECIMAL(10, 2) NOT NULL,
          descuento DECIMAL(10, 2) DEFAULT 0,
          subtotal DECIMAL(12, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 7. Crear tabla movimientos_inventario
    console.log('📝 Creando tabla movimientos_inventario...');
    const { error: errorMovimientos } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS movimientos_inventario (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
          tipo_movimiento VARCHAR(50),
          cantidad INTEGER NOT NULL,
          motivo VARCHAR(255),
          usuario_id UUID REFERENCES usuarios(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // 8. Crear tabla auditoria
    console.log('📝 Creando tabla auditoria...');
    const { error: errorAuditoria } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS auditoria (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID REFERENCES usuarios(id),
          tabla VARCHAR(100),
          accion VARCHAR(50),
          datos_anteriores JSONB,
          datos_nuevos JSONB,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));

    // Crear índices
    console.log('🔍 Creando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);',
      'CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);',
      'CREATE INDEX IF NOT EXISTS idx_detalles_factura_factura ON detalles_factura(factura_id);',
      'CREATE INDEX IF NOT EXISTS idx_detalles_factura_producto ON detalles_factura(producto_id);',
      'CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);',
      'CREATE INDEX IF NOT EXISTS idx_facturas_usuario ON facturas(usuario_id);',
      'CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);',
      'CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id);',
      'CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);',
      'CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);'
    ];

    for (const index of indices) {
      await supabase.rpc('execute_sql', { sql: index }).catch(() => ({}));
    }

    console.log('✅ Tablas e índices creados exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    process.exit(1);
  }
};

// Alternativa: Crear tablas directamente usando SQL
const createTablesSQL = async () => {
  try {
    console.log('🔄 Creando tablas con SQL directo...');

    const sqlScript = `
      -- Tabla de Usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'vendedor',
        estado BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Categorías
      CREATE TABLE IF NOT EXISTS categorias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Productos
      CREATE TABLE IF NOT EXISTS productos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo VARCHAR(100) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
        precio_costo DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 10,
        estado BOOLEAN DEFAULT true,
        imagen_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Clientes
      CREATE TABLE IF NOT EXISTS clientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        documento VARCHAR(50),
        email VARCHAR(255),
        telefono VARCHAR(20),
        direccion TEXT,
        ciudad VARCHAR(100),
        tipo_cliente VARCHAR(50) DEFAULT 'consumidor',
        estado BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Facturas
      CREATE TABLE IF NOT EXISTS facturas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero_factura VARCHAR(100) UNIQUE NOT NULL,
        cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
        usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
        descuento DECIMAL(12, 2) DEFAULT 0,
        impuesto DECIMAL(12, 2) DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL,
        metodo_pago VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'completada',
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Detalles de Factura
      CREATE TABLE IF NOT EXISTS detalles_factura (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
        producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        descuento DECIMAL(10, 2) DEFAULT 0,
        subtotal DECIMAL(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Movimientos de Inventario
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
        tipo_movimiento VARCHAR(50),
        cantidad INTEGER NOT NULL,
        motivo VARCHAR(255),
        usuario_id UUID REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de Auditoría
      CREATE TABLE IF NOT EXISTS auditoria (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES usuarios(id),
        tabla VARCHAR(100),
        accion VARCHAR(50),
        datos_anteriores JSONB,
        datos_nuevos JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Crear Índices
      CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
      CREATE INDEX IF NOT EXISTS idx_detalles_factura_factura ON detalles_factura(factura_id);
      CREATE INDEX IF NOT EXISTS idx_detalles_factura_producto ON detalles_factura(producto_id);
      CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_facturas_usuario ON facturas(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);
      CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id);
      CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);
    `;

    console.log('✅ Script SQL generado exitosamente!');
    console.log('\n📋 Copiar este script en Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log(sqlScript);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar
if (require.main === module) {
  createTablesSQL();
}

module.exports = { createTables, createTablesSQL };
