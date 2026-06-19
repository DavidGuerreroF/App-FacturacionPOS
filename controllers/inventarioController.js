const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador de Inventario
 */

// Obtener movimientos de inventario
exports.obtenerMovimientos = async (req, res) => {
  try {
    const { producto_id, tipo_movimiento } = req.query;
    let query = supabase.from('movimientos_inventario').select(`
      *,
      productos(id, nombre, codigo),
      usuarios(id, nombre)
    `);

    if (producto_id) {
      query = query.eq('producto_id', producto_id);
    }

    if (tipo_movimiento) {
      query = query.eq('tipo_movimiento', tipo_movimiento);
    }

    const { data: movimientos, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener movimientos' });
    }

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// Crear movimiento de inventario
exports.crearMovimiento = async (req, res) => {
  try {
    const { producto_id, tipo_movimiento, cantidad, motivo } = req.body;

    if (!producto_id || !tipo_movimiento || !cantidad) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    if (!['entrada', 'salida', 'ajuste'].includes(tipo_movimiento)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }

    // Crear movimiento
    const { data: movimiento, error: errorMovimiento } = await supabase
      .from('movimientos_inventario')
      .insert({
        id: uuidv4(),
        producto_id,
        tipo_movimiento,
        cantidad,
        motivo,
        usuario_id: req.user?.id,
      })
      .select()
      .single();

    if (errorMovimiento) {
      return res.status(500).json({ error: 'Error al crear movimiento' });
    }

    // Actualizar stock del producto
    if (tipo_movimiento === 'entrada' || tipo_movimiento === 'ajuste') {
      if (tipo_movimiento === 'entrada') {
        await supabase
          .from('productos')
          .update({
            stock_actual: supabase.raw('stock_actual + ?', [cantidad]),
          })
          .eq('id', producto_id);
      } else {
        // Para ajuste, simplemente actualizar el stock
        await supabase
          .from('productos')
          .update({
            stock_actual: cantidad,
          })
          .eq('id', producto_id);
      }
    } else if (tipo_movimiento === 'salida') {
      await supabase
        .from('productos')
        .update({
          stock_actual: supabase.raw('stock_actual - ?', [cantidad]),
        })
        .eq('id', producto_id);
    }

    res.status(201).json({
      mensaje: 'Movimiento de inventario registrado',
      movimiento,
    });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

// Obtener reporte de inventario
exports.obtenerReporte = async (req, res) => {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(id, nombre)
      `)
      .eq('estado', true);

    if (error) {
      return res.status(500).json({ error: 'Error al obtener inventario' });
    }

    // Calcular valor total de inventario
    const valorTotal = productos.reduce((sum, p) => {
      return sum + (p.stock_actual * p.precio_costo);
    }, 0);

    // Identificar productos con bajo stock
    const bajoStock = productos.filter(p => p.stock_actual <= p.stock_minimo);

    // Calcular rotación
    const productosSinMovimiento = productos.filter(p => p.stock_actual === 0);

    res.json({
      total_productos: productos.length,
      valor_inventario: valorTotal,
      productos_bajo_stock: bajoStock.length,
      productos_agotados: productosSinMovimiento.length,
      detalles: productos,
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};
