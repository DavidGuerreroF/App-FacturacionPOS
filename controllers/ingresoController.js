// ============= CONTROLADOR DE INGRESOS =============

// Registrar ingreso de vehículo
exports.registrarIngreso = (req, res) => {
    try {
        const { tipoVehiculo, placaVehiculo, parqueaderoId, espacioId, nombreCliente, telefonoCliente, traeCasco } = req.body;

        // Validar datos
        if (!tipoVehiculo || !placaVehiculo || !parqueaderoId || !espacioId) {
            return res.status(400).json({
                error: 'Faltan datos requeridos'
            });
        }

        const horaEntrada = new Date().toISOString();

        const sql = `
            INSERT INTO ingresos 
            (usuario_id, parqueadero_id, espacio_id, tipo_vehiculo, placa_vehiculo, hora_entrada)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        global.db.run(sql, [null, parqueaderoId, espacioId, tipoVehiculo, placaVehiculo, horaEntrada], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Actualizar estado del espacio
            const sqlEspacio = 'UPDATE espacios SET estado = ? WHERE id = ?';
            global.db.run(sqlEspacio, ['ocupado', espacioId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Si es moto y trae casco, registrar
                if (tipoVehiculo === 'moto' && traeCasco === 'si') {
                    const sqlCasco = `
                        INSERT INTO cascos (ingreso_id, cantidad, estado)
                        VALUES (?, ?, ?)
                    `;
                    global.db.run(sqlCasco, [this.lastID, 1, 'entregado'], (err) => {
                        if (err) console.error('Error al registrar casco:', err);
                    });
                } else if (tipoVehiculo === 'moto' && traeCasco === 'no') {
                    // Crear alerta de casco faltante
                    const sqlAlerta = `
                        INSERT INTO alertas (tipo, descripcion, ingreso_id, parqueadero_id, estado, prioridad)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    global.db.run(sqlAlerta, 
                        ['casco_faltante', `Moto ${placaVehiculo} ingresó sin casco`, this.lastID, parqueaderoId, 'activa', 'alta'],
                        (err) => {
                            if (err) console.error('Error al crear alerta:', err);
                        }
                    );
                }

                res.status(201).json({
                    id: this.lastID,
                    mensaje: '✅ Ingreso registrado exitosamente',
                    placa: placaVehiculo,
                    horaEntrada
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los ingresos
exports.obtenerIngresos = (req, res) => {
    try {
        const sql = `
            SELECT i.*, p.nombre as parqueadero_nombre, e.numero as espacio_numero
            FROM ingresos i
            LEFT JOIN parqueaderos p ON i.parqueadero_id = p.id
            LEFT JOIN espacios e ON i.espacio_id = e.id
            ORDER BY i.hora_entrada DESC
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

// Obtener ingresos activos (sin salida registrada)
exports.obtenerIngresosActivos = (req, res) => {
    try {
        const sql = `
            SELECT i.*, p.nombre as parqueadero_nombre, e.numero as espacio_numero
            FROM ingresos i
            LEFT JOIN parqueaderos p ON i.parqueadero_id = p.id
            LEFT JOIN espacios e ON i.espacio_id = e.id
            WHERE i.id NOT IN (SELECT ingreso_id FROM salidas)
            ORDER BY i.hora_entrada DESC
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

// Buscar ingreso activo por placa
exports.buscarIngresoActivoPorPlaca = (req, res) => {
    try {
        const { placa } = req.params;

        const sql = `
            SELECT i.*, p.nombre as parqueadero_nombre, e.numero as espacio_numero
            FROM ingresos i
            LEFT JOIN parqueaderos p ON i.parqueadero_id = p.id
            LEFT JOIN espacios e ON i.espacio_id = e.id
            WHERE i.placa_vehiculo = ? AND i.id NOT IN (SELECT ingreso_id FROM salidas)
            LIMIT 1
        `;

        global.db.get(sql, [placa.toUpperCase()], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({
                    error: 'Vehículo no encontrado o ya ha salido'
                });
            }

            // Obtener info de casco si es moto
            if (row.tipo_vehiculo === 'moto') {
                const sqlCasco = 'SELECT * FROM cascos WHERE ingreso_id = ? LIMIT 1';
                global.db.get(sqlCasco, [row.id], (err, casco) => {
                    row.traeCasco = casco ? 'si' : 'no';
                    res.json(row);
                });
            } else {
                res.json(row);
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener detalle de ingreso
exports.obtenerIngresoDetalle = (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT i.*, p.nombre as parqueadero_nombre, e.numero as espacio_numero
            FROM ingresos i
            LEFT JOIN parqueaderos p ON i.parqueadero_id = p.id
            LEFT JOIN espacios e ON i.espacio_id = e.id
            WHERE i.id = ?
        `;

        global.db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Ingreso no encontrado' });
            }

            res.json(row);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener ingresos del día
exports.obtenerIngresosDia = (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN tipo_vehiculo = 'auto' THEN 1 ELSE 0 END) as autos,
                SUM(CASE WHEN tipo_vehiculo = 'moto' THEN 1 ELSE 0 END) as motos
            FROM ingresos
            WHERE DATE(hora_entrada) = ?
        `;

        global.db.get(sql, [hoy], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(row || { total: 0, autos: 0, motos: 0 });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};