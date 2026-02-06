// ============= CONTROLADOR DE ALERTAS =============

// Obtener todas las alertas
exports.obtenerAlertas = (req, res) => {
    try {
        console.log('🔍 Obteniendo todas las alertas...');
        const sql = `
            SELECT * FROM alertas
            ORDER BY 
                CASE prioridad 
                    WHEN 'urgente' THEN 1 
                    WHEN 'alta' THEN 2 
                    WHEN 'media' THEN 3 
                    WHEN 'baja' THEN 4 
                END,
                createdAt DESC
        `;

        global.db.all(sql, (err, rows) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('✅ Alertas encontradas:', rows?.length || 0);
            res.json(rows || []);
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener alertas activas
exports.obtenerAlertasActivas = (req, res) => {
    try {
        console.log('🔍 Obteniendo alertas activas...');
        const sql = `
            SELECT * FROM alertas
            WHERE estado = 'activa'
            ORDER BY 
                CASE prioridad 
                    WHEN 'urgente' THEN 1 
                    WHEN 'alta' THEN 2 
                    WHEN 'media' THEN 3 
                    WHEN 'baja' THEN 4 
                END,
                createdAt DESC
        `;

        global.db.all(sql, (err, rows) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('✅ Alertas activas encontradas:', rows?.length || 0);
            res.json(rows || []);
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Crear alerta
exports.crearAlerta = (req, res) => {
    try {
        const { tipo, descripcion, ingresoId, usuarioId, parqueaderoId, prioridad } = req.body;

        console.log('➕ Creando alerta:', { tipo, descripcion });

        if (!tipo || !descripcion) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const sql = `
            INSERT INTO alertas (tipo, descripcion, ingreso_id, usuario_id, parqueadero_id, estado, prioridad)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        global.db.run(sql, 
            [tipo, descripcion, ingresoId || null, usuarioId || null, parqueaderoId || null, 'activa', prioridad || 'media'],
            function(err) {
                if (err) {
                    console.error('❌ Error en BD:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                console.log('✅ Alerta creada con ID:', this.lastID);
                res.status(201).json({
                    id: this.lastID,
                    mensaje: '✅ Alerta creada exitosamente'
                });
            }
        );

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener detalle de alerta
exports.obtenerAlertaDetalle = (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT a.*, p.nombre as parqueadero_nombre
            FROM alertas a
            LEFT JOIN parqueaderos p ON a.parqueadero_id = p.id
            WHERE a.id = ?
        `;

        global.db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Alerta no encontrada' });
            }

            res.json(row);
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar estado de alerta
exports.actualizarAlerta = (req, res) => {
    try {
        const { id } = req.params;
        const { estado, prioridad } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Estado es requerido' });
        }

        const sql = 'UPDATE alertas SET estado = ?, prioridad = ? WHERE id = ?';

        global.db.run(sql, [estado, prioridad || 'media', id], (err) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }

            console.log('✅ Alerta actualizada');
            res.json({
                mensaje: '✅ Alerta actualizada exitosamente'
            });
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener alertas de un parqueadero
exports.obtenerAlertasParqueadero = (req, res) => {
    try {
        const { parqueaderoId } = req.params;

        const sql = `
            SELECT * FROM alertas
            WHERE parqueadero_id = ?
            ORDER BY 
                CASE prioridad 
                    WHEN 'urgente' THEN 1 
                    WHEN 'alta' THEN 2 
                    WHEN 'media' THEN 3 
                    WHEN 'baja' THEN 4 
                END,
                createdAt DESC
        `;

        global.db.all(sql, [parqueaderoId], (err, rows) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener conteo de alertas activas
exports.obtenerConteoAlertas = (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN prioridad = 'urgente' THEN 1 ELSE 0 END) as urgentes,
                SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as altas,
                SUM(CASE WHEN prioridad = 'media' THEN 1 ELSE 0 END) as medias,
                SUM(CASE WHEN prioridad = 'baja' THEN 1 ELSE 0 END) as bajas
            FROM alertas
            WHERE estado = 'activa'
        `;

        global.db.get(sql, (err, row) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(row || { total: 0, urgentes: 0, altas: 0, medias: 0, bajas: 0 });
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};