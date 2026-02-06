// ============= MIDDLEWARE DE MANEJO DE ERRORES =============

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'JSON inválido en el request'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;