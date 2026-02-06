// ============= MIDDLEWARE DE VALIDACIÓN =============

// Validar placa
const validarPlaca = (req, res, next) => {
    const { placaVehiculo, placa } = req.body;
    const placaAValidar = placaVehiculo || placa;

    if (!placaAValidar) {
        return res.status(400).json({ error: 'Placa es requerida' });
    }

    // Normalizar placa
    const placaNormalizada = placaAValidar.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    if (!placaNormalizada) {
        return res.status(400).json({ error: 'Placa inválida' });
    }

    req.body.placaVehiculo = req.body.placaVehiculo ? placaNormalizada : placaAValidar;
    next();
};

// Validar tipo de vehículo
const validarTipoVehiculo = (req, res, next) => {
    const { tipoVehiculo } = req.body;

    if (!tipoVehiculo || !['auto', 'moto'].includes(tipoVehiculo)) {
        return res.status(400).json({
            error: 'Tipo de vehículo inválido. Debe ser "auto" o "moto"'
        });
    }

    next();
};

// Validar método de pago
const validarMetodoPago = (req, res, next) => {
    const { metodoPago } = req.body;

    if (!metodoPago || !['efectivo', 'tarjeta', 'transferencia'].includes(metodoPago)) {
        return res.status(400).json({
            error: 'Método de pago inválido. Debe ser "efectivo", "tarjeta" o "transferencia"'
        });
    }

    next();
};

module.exports = {
    validarPlaca,
    validarTipoVehiculo,
    validarMetodoPago
};