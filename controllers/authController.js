const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// ============= REGISTRAR USUARIO =============
exports.registrar = (req, res) => {
    try {
        console.log('📝 Registrando nuevo usuario...');
        
        const { nombre, email, password, rol } = req.body;

        // Validar
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                error: 'Nombre, email y contraseña son requeridos' 
            });
        }

        // Validar email formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        // Validar contraseña (mínimo 6 caracteres)
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener mínimo 6 caracteres' 
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = bcrypt.hashSync(password, saltRounds);

        // Insertar en BD
        const sql = `
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
        `;

        global.db.run(sql, [nombre, email, passwordHash, rol || 'operador'], function(err) {
            if (err) {
                console.error('❌ Error:', err.message);
                
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'El email ya está registrado' });
                }
                
                return res.status(500).json({ error: err.message });
            }

            console.log('✅ Usuario registrado con ID:', this.lastID);

            res.status(201).json({
                id: this.lastID,
                mensaje: '✅ Usuario registrado exitosamente',
                nombre,
                email
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ============= LOGIN =============
exports.login = (req, res) => {
    try {
        console.log('🔐 Intentando login...');
        
        const { email, password } = req.body;

        // Validar
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario
        const sql = 'SELECT * FROM usuarios WHERE email = ? AND estado = ?';
        
        global.db.get(sql, [email, '1'], (err, usuario) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!usuario) {
                console.log('❌ Usuario no encontrado');
                return res.status(401).json({ error: 'Email o contraseña incorrectos' });
            }

            // Verificar contraseña
            const passwordValida = bcrypt.compareSync(password, usuario.password);

            if (!passwordValida) {
                console.log('❌ Contraseña incorrecta');
                return res.status(401).json({ error: 'Email o contraseña incorrectos' });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ Login exitoso para:', email);

            res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                },
                mensaje: '✅ Login exitoso'
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ============= VERIFICAR TOKEN =============
exports.verificarToken = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        res.json({
            valido: true,
            usuario: decoded
        });

    } catch (error) {
        console.error('❌ Token inválido:', error.message);
        res.status(401).json({ 
            valido: false,
            error: 'Token inválido o expirado' 
        });
    }
};

// ============= OBTENER PERFIL =============
exports.obtenerPerfil = (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const sql = 'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?';

        global.db.get(sql, [usuarioId], (err, usuario) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(usuario);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};