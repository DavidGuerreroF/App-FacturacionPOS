require("dotenv").config();
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Script para popular datos de ejemplo
 * Ejecutar: node database/seedData.js
 */

const seedData = async () => {
  try {
    console.log('🌱 Iniciando población de datos de ejemplo...\n');

    // 1. Crear usuarios de ejemplo
    console.log('👤 Creando usuarios...');
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordVendedor = await bcrypt.hash('vendedor123', 10);

    const usuariosData = [
      {
        id: uuidv4(),
        nombre: 'Administrador',
        email: 'admin@almacen.com',
        contraseña: passwordAdmin,
        rol: 'admin',
        estado: true,
      },
      {
        id: uuidv4(),
        nombre: 'Juan Pérez',
        email: 'juan@almacen.com',
        contraseña: passwordVendedor,
        rol: 'vendedor',
        estado: true,
      },
      {
        id: uuidv4(),
        nombre: 'María García',
        email: 'maria@almacen.com',
        contraseña: passwordVendedor,
        rol: 'vendedor',
        estado: true,
      },
    ];

    const { error: errorUsuarios } = await supabase
      .from('usuarios')
      .insert(usuariosData);

    if (errorUsuarios) {
      console.log('⚠️  Usuarios ya existen o error:', errorUsuarios.message);
    } else {
      console.log('✅ Usuarios creados');
    }

    // 2. Crear categorías
    console.log('📂 Creando categorías...');
    const categoriasData = [
      {
        id: uuidv4(),
        nombre: 'Electrónica',
        descripcion: 'Productos electrónicos y dispositivos',
      },
      {
        id: uuidv4(),
        nombre: 'Ropa',
        descripcion: 'Prendas de vestir para hombre y mujer',
      },
      {
        id: uuidv4(),
        nombre: 'Alimentos',
        descripcion: 'Productos alimenticios y bebidas',
      },
      {
        id: uuidv4(),
        nombre: 'Accesorios',
        descripcion: 'Accesorios y complementos',
      },
      {
        id: uuidv4(),
        nombre: 'Hogar',
        descripcion: 'Artículos para el hogar',
      },
    ];

    const { error: errorCategorias } = await supabase
      .from('categorias')
      .insert(categoriasData);

    if (errorCategorias) {
      console.log('⚠️  Categorías ya existen o error:', errorCategorias.message);
    } else {
      console.log('✅ Categorías creadas');
    }

    // 3. Crear productos
    console.log('📦 Creando productos...');
    const productosData = [
      {
        id: uuidv4(),
        codigo: 'ELEC001',
        nombre: 'Laptop Dell XPS 13',
        descripcion: 'Laptop ultradelgada y potente',
        categoria_id: categoriasData[0].id,
        precio_costo: 800000,
        precio_venta: 1200000,
        stock_actual: 5,
        stock_minimo: 2,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ELEC002',
        nombre: 'Mouse Logitech Inalámbrico',
        descripcion: 'Mouse inalámbrico de precisión',
        categoria_id: categoriasData[0].id,
        precio_costo: 30000,
        precio_venta: 60000,
        stock_actual: 50,
        stock_minimo: 10,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ROPA001',
        nombre: 'Camiseta Básica Blanca',
        descripcion: 'Camiseta 100% algodón',
        categoria_id: categoriasData[1].id,
        precio_costo: 15000,
        precio_venta: 35000,
        stock_actual: 100,
        stock_minimo: 20,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ROPA002',
        nombre: 'Jeans Azul Oscuro',
        descripcion: 'Jeans clásicos talla regular',
        categoria_id: categoriasData[1].id,
        precio_costo: 40000,
        precio_venta: 90000,
        stock_actual: 45,
        stock_minimo: 10,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ALIM001',
        nombre: 'Café Premium 500g',
        descripcion: 'Café molido de alta calidad',
        categoria_id: categoriasData[2].id,
        precio_costo: 8000,
        precio_venta: 18000,
        stock_actual: 80,
        stock_minimo: 15,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ALIM002',
        nombre: 'Aceite de Oliva 1L',
        descripcion: 'Aceite de oliva virgen extra',
        categoria_id: categoriasData[2].id,
        precio_costo: 25000,
        precio_venta: 55000,
        stock_actual: 5,
        stock_minimo: 5,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'ACESS001',
        nombre: 'Reloj Digital Deportivo',
        descripcion: 'Reloj resistente al agua',
        categoria_id: categoriasData[3].id,
        precio_costo: 50000,
        precio_venta: 120000,
        stock_actual: 20,
        stock_minimo: 5,
        estado: true,
      },
      {
        id: uuidv4(),
        codigo: 'HOGAR001',
        nombre: 'Almohada Ergonómica',
        descripcion: 'Almohada de espuma memoria',
        categoria_id: categoriasData[4].id,
        precio_costo: 35000,
        precio_venta: 80000,
        stock_actual: 30,
        stock_minimo: 8,
        estado: true,
      },
    ];

    const { error: errorProductos } = await supabase
      .from('productos')
      .insert(productosData);

    if (errorProductos) {
      console.log('⚠️  Productos ya existen o error:', errorProductos.message);
    } else {
      console.log('✅ Productos creados');
    }

    // 4. Crear clientes
    console.log('👥 Creando clientes...');
    const clientesData = [
      {
        id: uuidv4(),
        nombre: 'Carlos Rodríguez',
        documento: '1234567890',
        email: 'carlos@email.com',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        tipo_cliente: 'consumidor',
        estado: true,
      },
      {
        id: uuidv4(),
        nombre: 'Empresa ABC SAS',
        documento: '9876543210',
        email: 'contacto@empresaabc.com',
        telefono: '3009876543',
        direccion: 'Carrera 50 #10-20',
        ciudad: 'Medellín',
        tipo_cliente: 'empresa',
        estado: true,
      },
      {
        id: uuidv4(),
        nombre: 'Laura Martínez',
        documento: '1111111111',
        email: 'laura@email.com',
        telefono: '3105555555',
        direccion: 'Avenida Principal 100',
        ciudad: 'Cali',
        tipo_cliente: 'consumidor',
        estado: true,
      },
      {
        id: uuidv4(),
        nombre: 'Distribuidora Nacional',
        documento: '2222222222',
        email: 'ventas@distribuidora.com',
        telefono: '3107777777',
        direccion: 'Zona Industrial Lote 5',
        ciudad: 'Barranquilla',
        tipo_cliente: 'empresa',
        estado: true,
      },
    ];

    const { error: errorClientes } = await supabase
      .from('clientes')
      .insert(clientesData);

    if (errorClientes) {
      console.log('⚠️  Clientes ya existen o error:', errorClientes.message);
    } else {
      console.log('✅ Clientes creados');
    }

    console.log('\n✅ Datos de ejemplo poblados exitosamente!\n');
    console.log('📋 Usuarios de prueba:');
    console.log('   Email: admin@almacen.com | Contraseña: admin123 (Admin)');
    console.log('   Email: juan@almacen.com | Contraseña: vendedor123 (Vendedor)');
    console.log('   Email: maria@almacen.com | Contraseña: vendedor123 (Vendedor)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar datos:', error);
    process.exit(1);
  }
};

// Ejecutar
if (require.main === module) {
  seedData();
}

module.exports = seedData;
