// ============= CONTROLADOR DE REPORTES =============

// Obtener estadísticas del día
exports.obtenerEstadisticasDia = (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        const sqlIngresos = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN tipo_vehiculo = 'auto' THEN 1 ELSE 0 END) as autos,
                SUM(CASE WHEN tipo_vehiculo = 'moto' THEN 1 ELSE 0 END) as motos
            FROM ingresos
            WHERE DATE(hora_entrada) = ?
        `;

        const sqlSalidas = `
            SELECT 
                COUNT(*) as total,
                SUM(costo_total) as ganancia_total
            FROM salidas
            WHERE DATE(hora_salida) = ?
        `;

        const sqlEspacios = `
            SELECT 
                SUM(CASE WHEN tipo_vehiculo = 'auto' AND estado = 'ocupado' THEN 1 ELSE 0 END) as autos_ocupados,
                SUM(CASE WHEN tipo_vehiculo = 'auto' THEN 1 ELSE 0 END) as autos_total,
                SUM(CASE WHEN tipo_vehiculo = 'moto' AND estado = 'ocupado' THEN 1 ELSE 0 END) as motos_ocupadas,
                SUM(CASE WHEN tipo_vehiculo = 'moto' THEN 1 ELSE 0 END) as motos_total,
                SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as espacios_disponibles
            FROM espacios
        `;

        global.db.get(sqlIngresos, [hoy], (err, ingresos) => {
            global.db.get(sqlSalidas, [hoy], (err, salidas) => {
                global.db.get(sqlEspacios, (err, espacios) => {
                    res.json({
                        fecha: hoy,
                        ingresos: ingresos || { total: 0, autos: 0, motos: 0 },
                        salidas: salidas || { total: 0, ganancia_total: 0 },
                        espacios: espacios || {},
                        autosEstacionados: (espacios?.autos_ocupados || 0),
                        motosEstacionadas: (espacios?.motos_ocupadas || 0),
                        espaciosDisponibles: (espacios?.espacios_disponibles || 0)
                    });
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener movimientos recientes
exports.obtenerMovimientosRecientes = (req, res) => {
    try {
        const sql = `
            SELECT 
                i.id,
                i.placa_vehiculo as placa,
                i.tipo_vehiculo as tipo,
                i.hora_entrada,
                s.hora_salida,
                s.costo_total as costo,
                CASE WHEN s.id IS NOT NULL THEN 'salida' ELSE 'ingreso' END as tipo_movimiento,
                CASE WHEN s.id IS NOT NULL THEN 'completado' ELSE 'en_progreso' END as estado
            FROM ingresos i
            LEFT JOIN salidas s ON i.id = s.ingreso_id
            ORDER BY COALESCE(s.hora_salida, i.hora_entrada) DESC
            LIMIT 20
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

// Obtener reporte por rango de fechas
exports.obtenerReportePorFecha = (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
        }

        const sql = `
            SELECT 
                DATE(COALESCE(s.hora_salida, i.hora_entrada)) as fecha,
                COUNT(DISTINCT i.id) as total_ingresos,
                SUM(CASE WHEN i.tipo_vehiculo = 'auto' THEN 1 ELSE 0 END) as autos,
                SUM(CASE WHEN i.tipo_vehiculo = 'moto' THEN 1 ELSE 0 END) as motos,
                SUM(s.costo_total) as ganancia_total,
                AVG(s.costo_total) as costo_promedio
            FROM ingresos i
            LEFT JOIN salidas s ON i.id = s.ingreso_id
            WHERE DATE(COALESCE(s.hora_salida, i.hora_entrada)) BETWEEN ? AND ?
            GROUP BY fecha
            ORDER BY fecha DESC
        `;

        global.db.all(sql, [fechaInicio, fechaFin], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener reporte por parqueadero
exports.obtenerReporteParqueadero = (req, res) => {
    try {
        const { parqueaderoId } = req.params;
        const hoy = new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                p.id,
                p.nombre,
                p.ubicacion,
                COUNT(DISTINCT i.id) as total_ingresos,
                SUM(CASE WHEN i.tipo_vehiculo = 'auto' THEN 1 ELSE 0 END) as autos,
                SUM(CASE WHEN i.tipo_vehiculo = 'moto' THEN 1 ELSE 0 END) as motos,
                SUM(s.costo_total) as ganancia_total,
                (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND estado = 'disponible') as espacios_disponibles
            FROM parqueaderos p
            LEFT JOIN ingresos i ON p.id = i.parqueadero_id AND DATE(i.hora_entrada) = ?
            LEFT JOIN salidas s ON i.id = s.ingreso_id
            WHERE p.id = ?
            GROUP BY p.id
        `;

        global.db.get(sql, [parqueaderoId, hoy, parqueaderoId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Parqueadero no encontrado' });
            }

            res.json(row);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener resumen general
exports.obtenerResumenGeneral = (req, res) => {
    try {
        const sqlTotal = `
            SELECT 
                COUNT(DISTINCT i.id) as total_vehiculos,
                SUM(s.costo_total) as ganancia_total,
                COUNT(DISTINCT i.parqueadero_id) as parqueaderos_activos
            FROM ingresos i
            LEFT JOIN salidas s ON i.id = s.ingreso_id
        `;

        const sqlHoy = `
            SELECT 
                COUNT(DISTINCT i.id) as ingresos_hoy,
                SUM(s.costo_total) as ganancia_hoy
            FROM ingresos i
            LEFT JOIN salidas s ON i.id = s.ingreso_id
            WHERE DATE(i.hora_entrada) = DATE('now')
        `;

        global.db.get(sqlTotal, (err, total) => {
            global.db.get(sqlHoy, (err, hoy) => {
                res.json({
                    totales: total || {},
                    hoy: hoy || {}
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};