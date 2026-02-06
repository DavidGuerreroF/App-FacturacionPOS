// ============= CONTROLADOR DE ESPACIOS =============

// Obtener espacios de un parqueadero
exports.obtenerEspacios = (req, res) => {
    try {
        const { parqueaderoId } = req.params;

        const sql = `
            SELECT * FROM espacios 
            WHERE parqueadero_id = ?
            ORDER BY numero
        `;

        global.db.all(sql, [parqueaderoId], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener espacios disponibles
exports.obtenerEspaciosDisponibles = (req, res) => {
    try {
        const { parqueaderoId } = req.params;
        const { tipo } = req.query;

        let sql = `
            SELECT * FROM espacios 
            WHERE parqueadero_id = ? AND estado = 'disponible'
        `;

        let params = [parqueaderoId];

        if (tipo) {
            sql += ' AND tipo_vehiculo = ?';
            params.push(tipo);
        }

        sql += ' ORDER BY numero';

        global.db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear espacios
exports.crearEspacios = (req, res) => {
    try {
        const { parqueaderoId, cantidad, tipoVehiculo } = req.body;

        if (!parqueaderoId || !cantidad || !tipoVehiculo) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        let espaciosCreados = 0;
        const sql = `
            INSERT INTO espacios (parqueadero_id, numero, tipo_vehiculo, estado)
            VALUES (?, ?, ?, ?)
        `;

        for (let i = 1; i <= cantidad; i++) {
            const prefijo = tipoVehiculo === 'auto' ? 'A' : 'M';
            const numero = `${prefijo}${i}`;

            global.db.run(sql, [parqueaderoId, numero, tipoVehiculo, 'disponible'], function(err) {
                if (!err) {
                    espaciosCreados++;
                }
            });
        }

        res.status(201).json({
            mensaje: `✅ ${espaciosCreados} espacios creados exitosamente`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener detalle de espacio
exports.obtenerEspacioDetalle = (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT e.*, p.nombre as parqueadero_nombre
            FROM espacios e
            LEFT JOIN parqueaderos p ON e.parqueadero_id = p.id
            WHERE e.id = ?
        `;

        global.db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Espacio no encontrado' });
            }

            res.json(row);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar estado de espacio
exports.actualizarEstadoEspacio = (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Estado es requerido' });
        }

        const sql = 'UPDATE espacios SET estado = ? WHERE id = ?';

        global.db.run(sql, [estado, id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                mensaje: '✅ Estado del espacio actualizado'
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener estadísticas de espacios
exports.obtenerEstadisticasEspacios = (req, res) => {
    try {
        const { parqueaderoId } = req.params;

        const sql = `
            SELECT 
                tipo_vehiculo,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
                SUM(CASE WHEN estado = 'ocupado' THEN 1 ELSE 0 END) as ocupados,
                SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
            FROM espacios
            WHERE parqueadero_id = ?
            GROUP BY tipo_vehiculo
        `;

        global.db.all(sql, [parqueaderoId], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};