const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Controlador de Usuarios
 */

// Login - Autenticar usuario
exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Obtener usuario
    const { data: usuarios, error: errorConsulta } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (errorConsulta || !usuarios) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuarios.contraseña);

    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuarios.estado) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuarios.id, email: usuarios.email, rol: usuarios.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      usuario: {
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Registro - Crear nuevo usuario
exports.registro = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol = 'vendedor' } = req.body;

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar que el usuario no exista
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (usuarioExistente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

    // Crear usuario
    const { data: nuevoUsuario, error: errorInsercion } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        email,
        contraseña: contraseñaEncriptada,
        rol,
      })
      .select()
      .single();

    if (errorInsercion) {
      return res.status(500).json({ error: 'Error al crear usuario' });
    }

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Obtener perfil del usuario actual
exports.getPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, estado, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Obtener todos los usuarios (solo admin)
exports.obtenerTodos = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, estado, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Actualizar usuario
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    // Verificar permisos
    if (req.user.id !== id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
    }

    const { data: usuarioActualizado, error } = await supabase
      .from('usuarios')
      .update({
        nombre,
        email,
        ...(req.user.rol === 'admin' && { rol }),
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Cambiar contraseña
exports.cambiarContraseña = async (req, res) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body;
    const userId = req.user.id;

    if (!contraseñaActual || !contraseñaNueva) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    // Obtener usuario actual
    const { data: usuario, error: errorConsulta } = await supabase
      .from('usuarios')
      .select('contraseña')
      .eq('id', userId)
      .single();

    if (errorConsulta) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Contraseña actual inválida' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(contraseñaNueva, salt);

    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        contraseña: contraseñaEncriptada,
        updated_at: new Date(),
      })
      .eq('id', userId);

    if (errorUpdate) {
      return res.status(500).json({ error: 'Error al cambiar contraseña' });
    }

    res.json({ mensaje: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

// Desactivar usuario (solo admin)
exports.desactivar = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ estado: false, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al desactivar usuario' });
    }

    res.json({ mensaje: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};
