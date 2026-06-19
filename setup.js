require("dotenv").config();
const initDatabase = require('./database/initDatabase');
const { createTablesSQL } = require('./database/createTables');

/**
 * Script de inicialización completa
 * Ejecutar: node setup.js
 */

const setup = async () => {
  try {
    console.log('🚀 Iniciando configuración de la aplicación...\n');

    console.log('1️⃣  Verificando conexión a Supabase...');
    await initDatabase();

    console.log('\n2️⃣  Generando script de tablas SQL...');
    createTablesSQL();

    console.log('\n✅ Configuración completada!\n');
    console.log('📋 Próximos pasos:');
    console.log('1. Ve a Supabase Dashboard → SQL Editor');
    console.log('2. Copia el script SQL mostrado arriba');
    console.log('3. Pégalo en el editor y ejecuta');
    console.log('4. Luego ejecuta: node database/seedData.js\n');

  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
};

// Ejecutar
if (require.main === module) {
  setup();
}

module.exports = setup;
