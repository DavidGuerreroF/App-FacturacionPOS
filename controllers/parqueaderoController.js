// ============= CONTROLADOR DE PARQUEADEROS =============

// Obtener todos los parqueaderos
exports.obtenerParqueaderos = (req, res) => {
    try {
        console.log('🔍 Obteniendo todos los parqueaderos...');
        const sql = 'SELECT * FROM parqueaderos ORDER BY nombre';

        global.db.all(sql, (err, rows) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('✅ Se encontraron', rows?.length || 0, 'parqueaderos');
            res.json(rows || []);
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Crear parqueadero
exports.crearParqueadero = (req, res) => {
    try {
        console.log('=====================');
        console.log('📝 CREAR PARQUEADERO');
        console.log('=====================');
        console.log('📦 Body recibido:', req.body);

        // Extraer datos - ser flexible con los nombres de propiedades
        let { 
            nombre, 
            ubicacion, 
            ciudad, 
            capacidadAutos, 
            capacidadMotos,
            capacidad_autos,
            capacidad_motos,
            tarifaAutoHora,
            tarifaMotoHora,
            tarifa_auto_por_hora,
            tarifa_moto_por_hora,
            descripcion, 
            telefono, 
            email 
        } = req.body;

        // Usar valores alternativos si existen
        capacidadAutos = capacidadAutos || capacidad_autos;
        capacidadMotos = capacidadMotos || capacidad_motos;
        tarifaAutoHora = tarifaAutoHora || tarifa_auto_por_hora || 5;
        tarifaMotoHora = tarifaMotoHora || tarifa_moto_por_hora || 2.5;

        console.log('✅ Datos extraídos:');
        console.log('   nombre:', nombre);
        console.log('   ubicacion:', ubicacion);
        console.log('   ciudad:', ciudad);
        console.log('   capacidadAutos:', capacidadAutos);
        console.log('   capacidadMotos:', capacidadMotos);

        // Validar datos REQUERIDOS
        if (!nombre || nombre.toString().trim() === '') {
            console.log('❌ Error: nombre está vacío');
            return res.status(400).json({ error: 'El nombre del parqueadero es requerido' });
        }

        if (!ubicacion || ubicacion.toString().trim() === '') {
            console.log('❌ Error: ubicacion está vacío');
            return res.status(400).json({ error: 'La ubicación es requerida' });
        }

        // Convertir a números
        const capAutos = parseInt(capacidadAutos) || 100;
        const capMotos = parseInt(capacidadMotos) || 50;
        const tarAuto = parseFloat(tarifaAutoHora) || 5;
        const tarMoto = parseFloat(tarifaMotoHora) || 2.5;
        const capTotal = capAutos + capMotos;

        console.log('✅ Datos validados y convertidos');
        console.log('   capTotal:', capTotal);

        const sql = `
            INSERT INTO parqueaderos 
            (nombre, ubicacion, ciudad, capacidad_total, capacidad_autos, capacidad_motos, 
             descripcion, telefono, email, tarifa_auto_por_hora, tarifa_moto_por_hora)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            nombre.toString().trim(),
            ubicacion.toString().trim(),
            ciudad ? ciudad.toString().trim() : '',
            capTotal,
            capAutos,
            capMotos,
            descripcion ? descripcion.toString().trim() : '',
            telefono ? telefono.toString().trim() : '',
            email ? email.toString().trim() : '',
            tarAuto,
            tarMoto
        ];

        console.log('🚀 Ejecutando SQL con params:', params);

        global.db.run(sql, params, function(err) {
            if (err) {
                console.error('❌ ERROR EN BD:', err.message);
                return res.status(500).json({ 
                    error: 'Error en la base de datos: ' + err.message
                });
            }

            console.log('✅ Parqueadero insertado con ID:', this.lastID);

            res.status(201).json({
                id: this.lastID,
                mensaje: '✅ Parqueadero creado exitosamente',
                nombre,
                ubicacion
            });
        });

    } catch (error) {
        console.error('❌ ERROR GENERAL:', error.message);
        res.status(500).json({ 
            error: 'Error: ' + error.message
        });
    }
};

// Obtener detalle de parqueadero
exports.obtenerParqueaderoDetalle = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Buscando parqueadero ID:', id);

        const sql = 'SELECT * FROM parqueaderos WHERE id = ?';

        global.db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                console.log('⚠️ Parqueadero no encontrado');
                return res.status(404).json({ error: 'Parqueadero no encontrado' });
            }

            console.log('✅ Parqueadero encontrado:', row.nombre);

            const sqlStats = `
                SELECT 
                    (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND estado = 'ocupado') as ocupados,
                    (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND estado = 'disponible') as disponibles,
                    (SELECT COUNT(*) FROM ingresos WHERE parqueadero_id = ? AND DATE(hora_entrada) = DATE('now')) as ingresos_hoy,
                    (SELECT SUM(costo_total) FROM salidas WHERE parqueadero_id = ? AND DATE(hora_salida) = DATE('now')) as ganancias_hoy
            `;

            global.db.get(sqlStats, [id, id, id, id], (err, stats) => {
                res.json({
                    ...row,
                    estadisticas: stats || {}
                });
            });
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar parqueadero
exports.actualizarParqueadero = (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, ubicacion, ciudad, descripcion, telefono, email, tarifaAutoHora, tarifaMotoHora } = req.body;

        console.log('✏️ Actualizando parqueadero ID:', id);

        const sql = `
            UPDATE parqueaderos 
            SET nombre = ?, ubicacion = ?, ciudad = ?, descripcion = ?, telefono = ?, email = ?, tarifa_auto_por_hora = ?, tarifa_moto_por_hora = ?
            WHERE id = ?
        `;

        global.db.run(sql, 
            [nombre, ubicacion, ciudad || '', descripcion || '', telefono || '', email || '', tarifaAutoHora || 5, tarifaMotoHora || 2.5, id],
            (err) => {
                if (err) {
                    console.error('❌ Error en BD:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                console.log('✅ Parqueadero actualizado');

                res.json({
                    mensaje: '✅ Parqueadero actualizado exitosamente'
                });
            }
        );

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener ocupación actual
exports.obtenerOcupacion = (req, res) => {
    try {
        const { id } = req.params;
        console.log('📊 Obteniendo ocupación del parqueadero ID:', id);

        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND tipo_vehiculo = 'auto' AND estado = 'ocupado') as autos_ocupados,
                (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND tipo_vehiculo = 'auto') as autos_total,
                (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND tipo_vehiculo = 'moto' AND estado = 'ocupado') as motos_ocupadas,
                (SELECT COUNT(*) FROM espacios WHERE parqueadero_id = ? AND tipo_vehiculo = 'moto') as motos_total
        `;

        global.db.get(sql, [id, id, id, id], (err, row) => {
            if (err) {
                console.error('❌ Error en BD:', err.message);
                return res.status(500).json({ error: err.message });
            }

            const datos = row || {};
            res.json({
                autos: {
                    ocupados: datos.autos_ocupados || 0,
                    total: datos.autos_total || 0,
                    disponibles: (datos.autos_total || 0) - (datos.autos_ocupados || 0),
                    porcentaje: datos.autos_total ? Math.round(((datos.autos_ocupados || 0) / datos.autos_total) * 100) : 0
                },
                motos: {
                    ocupadas: datos.motos_ocupadas || 0,
                    total: datos.motos_total || 0,
                    disponibles: (datos.motos_total || 0) - (datos.motos_ocupadas || 0),
                    porcentaje: datos.motos_total ? Math.round(((datos.motos_ocupadas || 0) / datos.motos_total) * 100) : 0
                }
            });
        });

    } catch (error) {
        console.error('❌ Error general:', error.message);
        res.status(500).json({ error: error.message });
    }
};