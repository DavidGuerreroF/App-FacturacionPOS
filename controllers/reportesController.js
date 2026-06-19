const supabase = require('../config/supabase');

/**
 * Controlador de Reportes
 */

// Reporte de ventas por período
exports.obtenerVentas = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let query = supabase
      .from('facturas')
      .select(`
        *,
        clientes(nombre),
        usuarios(nombre)
      `)
      .eq('estado', 'completada');

    if (desde) {
      query = query.gte('fecha', desde);
    }

    if (hasta) {
      query = query.lte('fecha', hasta);
    }

    const { data: facturas, error } = await query
      .order('fecha', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener ventas' });
    }

    // Calcular totales
    const totalVentas = facturas.reduce((sum, f) => sum + f.total, 0);
    const totalDescuentos = facturas.reduce((sum, f) => sum + f.descuento, 0);
    const totalImpuestos = facturas.reduce((sum, f) => sum + f.impuesto, 0);

    res.json({
      facturas,
      resumen: {
        total_facturas: facturas.length,
        total_ventas: totalVentas,
        total_descuentos: totalDescuentos,
        total_impuestos: totalImpuestos,
        promedio_venta: facturas.length > 0 ? totalVentas / facturas.length : 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

// Productos más vendidos
exports.obtenerProductosMasVendidos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: detalles, error } = await supabase
      .from('detalles_factura')
      .select(`
        producto_id,
        cantidad,
        precio_unitario,
        productos(id, nombre, codigo)
      `)
      .order('cantidad', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }

    // Agrupar por producto
    const productosAgrupados = {};
    detalles.forEach(d => {
      const key = d.producto_id;
      if (!productosAgrupados[key]) {
        productosAgrupados[key] = {
          ...d.productos,
          cantidad_total: 0,
          ingresos: 0,
        };
      }
      productosAgrupados[key].cantidad_total += d.cantidad;
      productosAgrupados[key].ingresos += d.cantidad * d.precio_unitario;
    });

    const productos = Object.values(productosAgrupados)
      .sort((a, b) => b.cantidad_total - a.cantidad_total)
      .slice(0, parseInt(limit));

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Clientes más activos
exports.obtenerClientesMasActivos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: facturas, error } = await supabase
      .from('facturas')
      .select(`
        cliente_id,
        total,
        clientes(id, nombre, email)
      `)
      .eq('estado', 'completada')
      .order('total', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener clientes' });
    }

    // Agrupar por cliente
    const clientesAgrupados = {};
    facturas.forEach(f => {
      if (!f.cliente_id) return; // Saltar consumidor final
      
      const key = f.cliente_id;
      if (!clientesAgrupados[key]) {
        clientesAgrupados[key] = {
          ...f.clientes,
          total_compras: 0,
          numero_facturas: 0,
        };
      }
      clientesAgrupados[key].total_compras += f.total;
      clientesAgrupados[key].numero_facturas += 1;
    });

    const clientes = Object.values(clientesAgrupados)
      .sort((a, b) => b.total_compras - a.total_compras)
      .slice(0, parseInt(limit));

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes activos:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Reporte general
exports.obtenerReporteGeneral = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    // Obtener facturas
    let queryFacturas = supabase
      .from('facturas')
      .select('*')
      .eq('estado', 'completada');

    if (desde) queryFacturas = queryFacturas.gte('fecha', desde);
    if (hasta) queryFacturas = queryFacturas.lte('fecha', hasta);

    const { data: facturas } = await queryFacturas;

    // Obtener productos
    const { data: productos } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', true);

    // Obtener clientes
    const { data: clientes } = await supabase
      .from('clientes')
      .select('*')
      .eq('estado', true);

    // Calcular KPIs
    const totalVentas = (facturas || []).reduce((sum, f) => sum + f.total, 0);
    const totalFacturas = facturas?.length || 0;
    const promedio = totalFacturas > 0 ? totalVentas / totalFacturas : 0;

    res.json({
      periodo: {
        desde: desde || 'Sin fecha',
        hasta: hasta || 'Sin fecha',
      },
      kpis: {
        total_ventas: totalVentas,
        numero_facturas: totalFacturas,
        promedio_venta: promedio,
        total_productos: productos?.length || 0,
        total_clientes: clientes?.length || 0,
      },
      resumen: {
        facturas: facturas || [],
        productos: productos || [],
        clientes: clientes || [],
      },
    });
  } catch (error) {
    console.error('Error al obtener reporte general:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};
