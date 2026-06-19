const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador de Facturas
 */

// Obtener todas las facturas
exports.obtenerTodas = async (req, res) => {
  try {
    const { estado, cliente_id, limit = 50 } = req.query;
    let query = supabase.from('facturas').select(`
      *,
      clientes(id, nombre),
      usuarios(id, nombre)
    `);

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }

    const { data: facturas, error } = await query
      .order('fecha', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }

    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

// Obtener factura por ID con detalles
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: factura, error: errorFactura } = await supabase
      .from('facturas')
      .select(`
        *,
        clientes(id, nombre, email, telefono),
        usuarios(id, nombre)
      `)
      .eq('id', id)
      .single();

    if (errorFactura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalles_factura')
      .select(`
        *,
        productos(id, nombre, codigo)
      `)
      .eq('factura_id', id);

    if (errorDetalles) {
      return res.status(500).json({ error: 'Error al obtener detalles' });
    }

    res.json({
      ...factura,
      detalles,
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
};

// Crear nueva factura
exports.crear = async (req, res) => {
  try {
    const {
      cliente_id,
      detalles,
      descuento = 0,
      metodo_pago = 'efectivo',
    } = req.body;

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ error: 'La factura debe tener detalles' });
    }

    // Generar número de factura
    const numero_factura = `FAC-${Date.now()}`;

    // Calcular totales
    let subtotal = 0;
    for (const detalle of detalles) {
      subtotal += detalle.precio_unitario * detalle.cantidad;
    }

    const impuesto = (subtotal - descuento) * 0.19; // IVA 19%
    const total = subtotal - descuento + impuesto;

    // Crear factura
    const { data: factura, error: errorFactura } = await supabase
      .from('facturas')
      .insert({
        id: uuidv4(),
        numero_factura,
        cliente_id: cliente_id || null,
        usuario_id: req.user?.id,
        subtotal,
        descuento,
        impuesto,
        total,
        metodo_pago,
        estado: 'completada',
      })
      .select()
      .single();

    if (errorFactura) {
      return res.status(500).json({ error: 'Error al crear factura' });
    }

    // Crear detalles de factura y actualizar stock
    const detallesInsert = detalles.map(d => ({
      id: uuidv4(),
      factura_id: factura.id,
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.precio_unitario * d.cantidad,
    }));

    const { error: errorDetalles } = await supabase
      .from('detalles_factura')
      .insert(detallesInsert);

    if (errorDetalles) {
      return res.status(500).json({ error: 'Error al agregar detalles' });
    }

    // Actualizar stock de productos
    for (const detalle of detalles) {
      await supabase
        .from('productos')
        .update({
          stock_actual: supabase.raw('stock_actual - ?', [detalle.cantidad]),
        })
        .eq('id', detalle.producto_id);

      // Registrar movimiento de inventario
      await supabase.from('movimientos_inventario').insert({
        id: uuidv4(),
        producto_id: detalle.producto_id,
        tipo_movimiento: 'salida',
        cantidad: detalle.cantidad,
        motivo: `Venta factura ${numero_factura}`,
        usuario_id: req.user?.id,
      });
    }

    res.status(201).json({
      mensaje: 'Factura creada exitosamente',
      factura: {
        ...factura,
        detalles: detallesInsert,
      },
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
};

// Actualizar estado de factura
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['completada', 'cancelada', 'borrador'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { data: facturaActualizada, error } = await supabase
      .from('facturas')
      .update({
        estado,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar factura' });
    }

    res.json({
      mensaje: 'Factura actualizada exitosamente',
      factura: facturaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
};

// Cancelar factura
exports.cancelar = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener factura
    const { data: factura, error: errorObtener } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .single();

    if (errorObtener) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Obtener detalles
    const { data: detalles } = await supabase
      .from('detalles_factura')
      .select('*')
      .eq('factura_id', id);

    // Devolver stock
    if (Array.isArray(detalles)) {
      for (const detalle of detalles) {
        await supabase
          .from('productos')
          .update({
            stock_actual: supabase.raw('stock_actual + ?', [detalle.cantidad]),
          })
          .eq('id', detalle.producto_id);

        // Registrar movimiento
        await supabase.from('movimientos_inventario').insert({
          id: require('uuid').v4(),
          producto_id: detalle.producto_id,
          tipo_movimiento: 'entrada',
          cantidad: detalle.cantidad,
          motivo: `Devolución por cancelación de factura ${factura.numero_factura}`,
          usuario_id: req.user?.id,
        });
      }
    }

    // Actualizar factura
    const { error } = await supabase
      .from('facturas')
      .update({
        estado: 'cancelada',
        updated_at: new Date(),
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al cancelar factura' });
    }

    res.json({ mensaje: 'Factura cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar factura:', error);
    res.status(500).json({ error: 'Error al cancelar factura' });
  }
};
