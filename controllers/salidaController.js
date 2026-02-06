// ============= CONTROLADOR DE SALIDAS =============

// Registrar salida de vehículo
exports.registrarSalida = (req, res) => {
    try {
        const { ingresoId } = req.params;
        const { horaSalida, tiempoParqueoMinutos, costoTotal, metodoPago } = req.body;

        // Validar datos
        if (!horaSalida || costoTotal === undefined || !metodoPago) {
            return res.status(400).json({
                error: 'Faltan datos requeridos'
            });
        }

        // Obtener datos del ingreso
        const sqlIngreso = 'SELECT * FROM ingresos WHERE id = ?';
        global.db.get(sqlIngreso, [ingresoId], (err, ingreso) => {
            if (err || !ingreso) {
                return res.status(404).json({ error: 'Ingreso no encontrado' });
            }

            // Registrar salida
            const sqlSalida = `
                INSERT INTO salidas 
                (ingreso_id, usuario_id, parqueadero_id, espacio_id, hora_salida, tiempo_parqueo_minutos, costo_total, metodo_pago)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            global.db.run(sqlSalida, 
                [ingresoId, null, ingreso.parqueadero_id, ingreso.espacio_id, horaSalida, tiempoParqueoMinutos, costoTotal, metodoPago],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Liberar espacio
                    const sqlEspacio = 'UPDATE espacios SET estado = ? WHERE id = ?';
                    global.db.run(sqlEspacio, ['disponible', ingreso.espacio_id], (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        res.status(201).json({
                            id: this.lastID,
                            mensaje: '✅ Salida registrada exitosamente',
                            ingresoId,
                            costoTotal,
                            tiempoParqueo: `${Math.floor(tiempoParqueoMinutos / 60)}h ${tiempoParqueoMinutos % 60}m`
                        });
                    });
                }
            );
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las salidas
exports.obtenerSalidas = (req, res) => {
    try {
        const sql = `
            SELECT s.*, i.placa_vehiculo, i.tipo_vehiculo, p.nombre as parqueadero_nombre
            FROM salidas s
            LEFT JOIN ingresos i ON s.ingreso_id = i.id
            LEFT JOIN parqueaderos p ON s.parqueadero_id = p.id
            ORDER BY s.hora_salida DESC
        `;

        global.db.all(sql, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener detalle de salida
exports.obtenerSalidaDetalle = (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT s.*, i.placa_vehiculo, i.tipo_vehiculo, p.nombre as parqueadero_nombre
            FROM salidas s
            LEFT JOIN ingresos i ON s.ingreso_id = i.id
            LEFT JOIN parqueaderos p ON s.parqueadero_id = p.id
            WHERE s.id = ?
        `;

        global.db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Salida no encontrada' });
            }

            res.json(row);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener salidas del día
exports.obtenerSalidasDia = (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(costo_total) as ganancia_total,
                AVG(costo_total) as costo_promedio
            FROM salidas
            WHERE DATE(hora_salida) = ?
        `;

        global.db.get(sql, [hoy], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(row || { total: 0, ganancia_total: 0, costo_promedio: 0 });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener ganancias por método de pago
exports.obtenerGananciasPorMetodo = (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                metodo_pago,
                COUNT(*) as transacciones,
                SUM(costo_total) as total
            FROM salidas
            WHERE DATE(hora_salida) = ?
            GROUP BY metodo_pago
        `;

        global.db.all(sql, [hoy], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};