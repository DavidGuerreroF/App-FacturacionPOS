const supabase = require('../config/supabase');

/**
 * Middleware de auditoría
 * Registra todas las acciones en la tabla de auditoría
 */
const auditMiddleware = async (req, res, next) => {
  // Guardar el método y ruta original
  req.auditData = {
    metodo: req.method,
    ruta: req.path,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date(),
  };

  // Interceptar respuesta para auditar
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (req.user && req.method !== 'GET') {
      // Registrar cambios en auditoría
      registrarAuditoria(req, data);
    }
    return originalJson(data);
  };

  next();
};

const registrarAuditoria = async (req, data) => {
  try {
    // Extraer tabla y acción del endpoint
    const partes = req.path.split('/');
    const tabla = partes[2] || 'desconocida';
    const accion = req.method;

    await supabase.from('auditoria').insert({
      usuario_id: req.user.id,
      tabla: tabla,
      accion: accion,
      datos_nuevos: data,
      ip_address: req.auditData.ip,
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // No interrumpir la respuesta si falla la auditoría
  }
};

module.exports = auditMiddleware;
