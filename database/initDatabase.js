require("dotenv").config();
const supabase = require('../config/supabase');

const initDatabase = async () => {
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .select('count()', { count: 'exact', head: true });

    if (error) {
      console.log('Creando tablas en Supabase...');
      // Las tablas deben crearse desde el dashboard de Supabase
      // Este es solo un verificador de conexión
      console.log('⚠️  Por favor, crea las tablas en Supabase según el schema.sql');
      return;
    }

    console.log('✅ Conexión a Supabase establecida correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
};

module.exports = initDatabase;
