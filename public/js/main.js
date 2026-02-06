// ============= VARIABLES GLOBALES =============
let parqueaderosData = [];
let ingresoActualBuscado = null;
let alertasData = [];
// ============= VERIFICAR AUTENTICACIÓN =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ Verificando autenticación...');

    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (!token || !usuario) {
        console.log('❌ No hay sesión. Redirigiendo a login...');
        window.location.href = 'login.html';
        return;
    }

    // Mostrar nombre del usuario
    const usuarioData = JSON.parse(usuario);
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.innerHTML = `<i class="fas fa-parking"></i> ParkControl - ${usuarioData.nombre}`;
    }

   
});
// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ Aplicación cargada');

    // Cargar datos iniciales
    await cargarParqueaderos();
    await actualizarEstadisticas();
    await cargarAlertas();

    // Event listeners para formularios
    document.getElementById('formIngreso')?.addEventListener('submit', manejarIngreso);
    document.getElementById('formSalida')?.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarVehiculo();
    });

    // Recargar estadísticas cada 30 segundos
    setInterval(actualizarEstadisticas, 30000);
    setInterval(cargarAlertas, 30000);

    console.log('✅ Event listeners configurados');
});

// ============= CARGAR PARQUEADEROS =============
async function cargarParqueaderos() {
    console.log('🔍 Cargando parqueaderos...');
    const datos = await obtenerParqueaderos();

    if (!datos) {
        console.error('❌ Error al cargar parqueaderos');
        return;
    }

    parqueaderosData = datos;
    console.log('✅ Parqueaderos cargados:', datos.length);

    // Llenar select de parqueaderos en INGRESOS
    const selectParqueo = document.getElementById('parqueaderoIngreso');
    if (selectParqueo) {
        selectParqueo.innerHTML = '<option value="">Selecciona parqueadero...</option>';

        datos.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} - ${p.ubicacion}`;
            selectParqueo.appendChild(option);
        });
    }
}

// ============= CARGAR ALERTAS =============
async function cargarAlertas() {
    console.log('🔔 Cargando alertas...');
    const alertas = await obtenerAlertas();

    if (!alertas) {
        console.error('❌ Error al cargar alertas');
        return;
    }

    alertasData = alertas;
    console.log('✅ Alertas cargadas:', alertas.length);

    // Mostrar alertas en la sección de alertas
    mostrarAlertas(alertas);
}

// Mostrar alertas en la UI
function mostrarAlertas(alertas) {
    const listaAlertas = document.getElementById('listaalertas');
    if (!listaAlertas) return;

    listaAlertas.innerHTML = '';

    if (!alertas || alertas.length === 0) {
        listaAlertas.innerHTML = '<p class="text-center text-muted">No hay alertas</p>';
        return;
    }

    alertas.forEach(alerta => {
        const div = document.createElement('div');
        div.className = `alerta-item ${alerta.prioridad}`;
        
        div.innerHTML = `
            <div class="alerta-header">
                <div class="alerta-titulo">
                    <i class="fas fa-exclamation-circle"></i> ${alerta.tipo.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div class="alerta-badges">
                    <span class="alerta-badge tipo">${alerta.tipo}</span>
                    <span class="alerta-badge estado">${alerta.estado}</span>
                    <span class="alerta-badge prioridad">${alerta.prioridad}</span>
                </div>
            </div>
            <div class="alerta-descripcion">${alerta.descripcion}</div>
            <div class="alerta-fecha">
                <small>Creada: ${new Date(alerta.createdAt).toLocaleString('es-CO')}</small>
            </div>
        `;
        
        listaAlertas.appendChild(div);
    });
}

// Filtrar alertas
function filtrarAlertas() {
    const tipoFiltro = document.getElementById('filtroAlerta')?.value || '';
    const estadoFiltro = document.getElementById('filtroEstado')?.value || '';
    const prioridadFiltro = document.getElementById('filtroPrioridad')?.value || '';

    const filtradas = alertasData.filter(alerta => {
        const cumpleTipo = !tipoFiltro || alerta.tipo === tipoFiltro;
        const cumpleEstado = !estadoFiltro || alerta.estado === estadoFiltro;
        const cumplePrioridad = !prioridadFiltro || alerta.prioridad === prioridadFiltro;
        
        return cumpleTipo && cumpleEstado && cumplePrioridad;
    });

    mostrarAlertas(filtradas);
}

// ============= MANEJAR INGRESO =============
async function manejarIngreso(e) {
    e.preventDefault();

    console.log('📝 Procesando ingreso...');

    const datos = {
        tipoVehiculo: document.getElementById('tipoVehiculo')?.value,
        placaVehiculo: normalizarPlaca(document.getElementById('placaVehiculo')?.value || ''),
        parqueaderoId: parseInt(document.getElementById('parqueaderoIngreso')?.value),
        espacioId: 1, // ID dummy, no se usa
        nombreCliente: document.getElementById('nombreCliente')?.value || 'No especificado',
        telefonoCliente: document.getElementById('telefonoCliente')?.value || '',
        traeCasco: document.querySelector('input[name="casco"]:checked')?.value || 'no',
        horaEntrada: new Date().toISOString()
    };

    console.log('📦 Datos del ingreso:', datos);

    // Validar que no sea vacío
    if (!datos.placaVehiculo) {
        console.error('❌ Placa vacía');
        mostrarNotificacion('Por favor ingresa una placa válida', 'warning');
        return;
    }

    if (!datos.tipoVehiculo || !datos.parqueaderoId) {
        console.error('❌ Faltan campos requeridos');
        mostrarNotificacion('Por favor completa todos los campos', 'warning');
        return;
    }

    const resultado = await registrarIngreso(datos);

    if (resultado) {
        console.log('✅ Ingreso registrado:', resultado);
        mostrarNotificacion('✅ Ingreso registrado exitosamente', 'success');
        document.getElementById('formIngreso')?.reset();
        await actualizarEstadisticas();
        await cargarAlertas();
    } else {
        console.error('❌ Error al registrar ingreso');
        mostrarNotificacion('❌ Error al registrar ingreso', 'danger');
    }
}

// ============= BUSCAR VEHÍCULO =============
async function buscarVehiculo() {
    const placa = normalizarPlaca(document.getElementById('placaSalida')?.value || '');

    console.log('🔍 Buscando vehículo:', placa);

    if (!placa) {
        console.error('❌ Placa vacía');
        mostrarNotificacion('Por favor ingresa una placa válida', 'warning');
        return;
    }

    const resultado = await buscarIngresoActivo(placa);

    if (!resultado || resultado.error) {
        console.error('❌ Vehículo no encontrado');
        mostrarNotificacion('❌ Vehículo no encontrado o ya ha salido', 'danger');
        document.getElementById('detallesSalida')?.classList.add('hidden');
        return;
    }

    console.log('✅ Vehículo encontrado:', resultado);

    // Mostrar detalles
    const horaEntrada = new Date(resultado.hora_entrada);
    const ahora = new Date();
    const minutos = calcularMinutos(horaEntrada, ahora);
    const horas = Math.ceil(minutos / 60); // Cobrar por horas completas

    // Obtener tarifa según tipo de vehículo
    const parqueadero = parqueaderosData.find(p => p.id === resultado.parqueadero_id);
    const tarifa = resultado.tipo_vehiculo === 'auto'
        ? parqueadero?.tarifa_auto_por_hora || 5
        : parqueadero?.tarifa_moto_por_hora || 2.5;

    const costo = horas * tarifa;

    const salidaPlacaEl = document.getElementById('salidaPlaca');
    const salidaTipoEl = document.getElementById('salidaTipo');
    const salidaEntradaEl = document.getElementById('salidaEntrada');
    const salidaTiempoEl = document.getElementById('salidaTiempo');
    const salidaCostoEl = document.getElementById('salidaCosto');
    const salidaCascoEl = document.getElementById('salidaCasco');

    if (salidaPlacaEl) salidaPlacaEl.textContent = resultado.placa_vehiculo;
    if (salidaTipoEl) salidaTipoEl.textContent = resultado.tipo_vehiculo.toUpperCase();
    if (salidaEntradaEl) salidaEntradaEl.textContent = formatearHora(horaEntrada);
    if (salidaTiempoEl) salidaTiempoEl.textContent = calcularHoras(minutos);
    if (salidaCostoEl) salidaCostoEl.textContent = formatearMoneda(costo);

    // Validar casco
    const validacionCasco = document.getElementById('validacionCasco');
    if (resultado.tipo_vehiculo === 'moto' && resultado.traeCasco === 'no') {
        if (validacionCasco) validacionCasco.classList.remove('hidden');
        if (salidaCascoEl) salidaCascoEl.textContent = '⚠️ NO TRAE CASCO';
    } else {
        if (validacionCasco) validacionCasco.classList.add('hidden');
        if (salidaCascoEl) salidaCascoEl.textContent = resultado.tipo_vehiculo === 'moto' ? 'Sí' : 'N/A';
    }

    ingresoActualBuscado = {
        ...resultado,
        minutos,
        costo
    };

    const detallesSalida = document.getElementById('detallesSalida');
    if (detallesSalida) {
        detallesSalida.classList.remove('hidden');
    }
}

// ============= REGISTRAR SALIDA =============
async function registrarSalida() {
    if (!ingresoActualBuscado) {
        console.error('❌ No hay ingreso seleccionado');
        return;
    }

    const metodoPago = document.getElementById('metodoPago')?.value;

    if (!metodoPago) {
        console.error('❌ Método de pago no seleccionado');
        mostrarNotificacion('Por favor selecciona un método de pago', 'warning');
        return;
    }

    console.log('💳 Registrando salida con método:', metodoPago);

    const datos = {
        horaSalida: new Date().toISOString(),
        tiempoParqueoMinutos: ingresoActualBuscado.minutos,
        costoTotal: ingresoActualBuscado.costo,
        metodoPago: metodoPago
    };

    // ⚠️ IMPORTANTE: Llamar a la función de API, no a sí misma
    const resultado = await registrarSalidaAPI(ingresoActualBuscado.id, datos);

    if (resultado) {
        console.log('✅ Salida registrada:', resultado);
        mostrarNotificacion(`✅ Salida registrada. Costo: ${formatearMoneda(ingresoActualBuscado.costo)}`, 'success');

        // Limpiar formulario
        document.getElementById('formSalida')?.reset();
        document.getElementById('detallesSalida')?.classList.add('hidden');
        ingresoActualBuscado = null;

        await actualizarEstadisticas();
        await cargarAlertas();
    } else {
        console.error('❌ Error al registrar salida');
        mostrarNotificacion('❌ Error al registrar salida', 'danger');
    }
}
// ============= ACTUALIZAR ESTADÍSTICAS =============
async function actualizarEstadisticas() {
    console.log('📊 Actualizando estadísticas...');

    try {
        // Obtener datos
        const estadisticas = await obtenerEstadisticasDia();
        const alertas = await obtenerAlertas();
        const movimientos = await obtenerMovimientos();

        if (estadisticas) {
            console.log('✅ Estadísticas:', estadisticas);

            const autosEl = document.getElementById('autosEstacionados');
            const motosEl = document.getElementById('motosEstacionadas');
            const ingresosEl = document.getElementById('ingresosHoy');

            if (autosEl) autosEl.textContent = estadisticas.autosEstacionados || 0;
            if (motosEl) motosEl.textContent = estadisticas.motosEstacionadas || 0;
            if (ingresosEl) ingresosEl.textContent = (estadisticas.ingresos?.total || 0);
        }

        if (alertas) {
            console.log('✅ Alertas activas:', alertas.length);
            const alertasActivasEl = document.getElementById('alertasActivas');
            const alertaBadgeEl = document.getElementById('alertaBadge');

            const activas = alertas.filter(a => a.estado === 'activa').length;
            if (alertasActivasEl) alertasActivasEl.textContent = activas;
            if (alertaBadgeEl) alertaBadgeEl.textContent = activas;
        }

        if (movimientos) {
            cargarTablaMovimientos(movimientos);
        }
    } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
    }
}

// Cargar tabla de movimientos
function cargarTablaMovimientos(movimientos) {
    console.log('📋 Cargando tabla de movimientos...');

    const tbody = document.getElementById('tbodyMovimientos');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!movimientos || movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay movimientos registrados</td></tr>';
        return;
    }

    movimientos.slice(0, 10).forEach(mov => {
        const row = document.createElement('tr');
        const hora = new Date(mov.hora_entrada || mov.hora_salida).toLocaleTimeString('es-CO');
        const tipoMov = mov.tipo_movimiento === 'salida' ? '🔓 Salida' : '🔒 Ingreso';

        // Cambiar "en_progreso" a "En Progreso" solo si tipo_movimiento es 'ingreso'
        let estadoTexto = 'Completado';
        if (mov.estado === 'en_progreso') {
            estadoTexto = 'En Progreso';
        }

        row.innerHTML = `
            <td>${hora}</td>
            <td><strong>${mov.placa}</strong></td>
            <td>${mov.tipo.toUpperCase()}</td>
            <td>${tipoMov}</td>
            <td><span class="badge">${estadoTexto}</span></td>
        `;
        tbody.appendChild(row);
    });
}