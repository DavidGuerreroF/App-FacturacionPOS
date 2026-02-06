const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// ============= MIDDLEWARE DE AUTENTICACIÓN =============
const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        
        console.log('✅ Token válido para:', decoded.email);
        next();

    } catch (error) {
        console.error('❌ Token inválido:', error.message);
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// ============= MIDDLEWARE DE AUTORIZACIÓN (Solo admin) =============
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores' });
    }
    next();
};

module.exports = {
    verificarToken,
    esAdmin
};