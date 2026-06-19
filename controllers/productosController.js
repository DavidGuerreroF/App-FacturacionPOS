const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador de Productos
 */

// Obtener todos los productos
exports.obtenerTodos = async (req, res) => {
  try {
    const { categoria_id, estado, buscar } = req.query;
    let query = supabase.from('productos').select(`
      *,
      categorias(id, nombre)
    `);

    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }

    if (estado !== undefined) {
      query = query.eq('estado', estado === 'true');
    }

    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,codigo.ilike.%${buscar}%`);
    }

    const { data: productos, error } = await query.order('nombre', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener producto por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: producto, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(id, nombre)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear nuevo producto
exports.crear = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      categoria_id,
      precio_costo,
      precio_venta,
      stock_actual,
      stock_minimo,
      imagen_url,
    } = req.body;

    if (!codigo || !nombre || !precio_costo || !precio_venta) {
      return res.status(400).json({
        error: 'Código, nombre, precio de costo y precio de venta son requeridos',
      });
    }

    // Verificar que el código sea único
    const { data: productoExistente } = await supabase
      .from('productos')
      .select('id')
      .eq('codigo', codigo)
      .single();

    if (productoExistente) {
      return res.status(409).json({ error: 'El código de producto ya existe' });
    }

    const { data: nuevoProducto, error } = await supabase
      .from('productos')
      .insert({
        id: uuidv4(),
        codigo,
        nombre,
        descripcion,
        categoria_id,
        precio_costo: parseFloat(precio_costo),
        precio_venta: parseFloat(precio_venta),
        stock_actual: parseInt(stock_actual) || 0,
        stock_minimo: parseInt(stock_minimo) || 10,
        imagen_url,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al crear producto' });
    }

    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Actualizar producto
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      descripcion,
      categoria_id,
      precio_costo,
      precio_venta,
      stock_minimo,
      imagen_url,
      estado,
    } = req.body;

    const { data: productoActualizado, error } = await supabase
      .from('productos')
      .update({
        codigo,
        nombre,
        descripcion,
        categoria_id,
        precio_costo: precio_costo ? parseFloat(precio_costo) : undefined,
        precio_venta: precio_venta ? parseFloat(precio_venta) : undefined,
        stock_minimo: stock_minimo ? parseInt(stock_minimo) : undefined,
        imagen_url,
        estado,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar producto' });
    }

    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto: productoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Obtener productos con bajo stock
exports.obtenerBajoStock = async (req, res) => {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(id, nombre)
      `)
      .lte('stock_actual', 'stock_minimo')
      .eq('estado', true);

    if (error) {
      return res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
    }

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error);
    res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
  }
};

// Eliminar producto
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no hay facturas con este producto
    const { data: detalles } = await supabase
      .from('detalles_factura')
      .select('id', { count: 'exact' })
      .eq('producto_id', id);

    if (detalles && detalles.length > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar el producto, tiene facturas asociadas',
      });
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }

    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
