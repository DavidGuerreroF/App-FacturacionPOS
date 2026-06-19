const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador de Clientes
 */

// Obtener todos los clientes
exports.obtenerTodos = async (req, res) => {
  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('estado', true)
      .order('nombre', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener clientes' });
    }

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Crear nuevo cliente
exports.crear = async (req, res) => {
  try {
    const {
      nombre,
      documento,
      email,
      telefono,
      direccion,
      ciudad,
      tipo_cliente = 'consumidor',
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const { data: nuevoCliente, error } = await supabase
      .from('clientes')
      .insert({
        id: uuidv4(),
        nombre,
        documento,
        email,
        telefono,
        direccion,
        ciudad,
        tipo_cliente,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al crear cliente' });
    }

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: nuevoCliente,
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Actualizar cliente
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      documento,
      email,
      telefono,
      direccion,
      ciudad,
      tipo_cliente,
    } = req.body;

    const { data: clienteActualizado, error } = await supabase
      .from('clientes')
      .update({
        nombre,
        documento,
        email,
        telefono,
        direccion,
        ciudad,
        tipo_cliente,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar cliente' });
    }

    res.json({
      mensaje: 'Cliente actualizado exitosamente',
      cliente: clienteActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Desactivar cliente (soft delete)
exports.desactivar = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('clientes')
      .update({ estado: false, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al desactivar cliente' });
    }

    res.json({ mensaje: 'Cliente desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ error: 'Error al desactivar cliente' });
  }
};
