const supabase = require('../config/supabase');

/**
 * Controlador de Categorías
 */

// Obtener todas las categorías
exports.obtenerTodas = async (req, res) => {
  try {
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener categoría por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: categoria, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear nueva categoría
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const { data: categoriaExistente } = await supabase
      .from('categorias')
      .select('id')
      .eq('nombre', nombre)
      .single();

    if (categoriaExistente) {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }

    const { data: nuevaCategoria, error } = await supabase
      .from('categorias')
      .insert({ nombre, descripcion })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al crear categoría' });
    }

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      categoria: nuevaCategoria,
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Actualizar categoría
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const { data: categoriaActualizada, error } = await supabase
      .from('categorias')
      .update({
        nombre,
        descripcion,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar categoría' });
    }

    res.json({
      mensaje: 'Categoría actualizada exitosamente',
      categoria: categoriaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Eliminar categoría
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no hay productos en esta categoría
    const { data: productos } = await supabase
      .from('productos')
      .select('id', { count: 'exact' })
      .eq('categoria_id', id);

    if (productos && productos.length > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar la categoría, tiene productos asociados',
      });
    }

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar categoría' });
    }

    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};
