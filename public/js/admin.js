// ============= FUNCIONES DE ADMINISTRACIÓN =============

// Cambiar entre tabs
function cambiarTab(tabId) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar tab seleccionado
    const tabElement = document.getElementById(`tab-${tabId}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    // Activar botón seleccionado
    event.target.closest('.tab-btn').classList.add('active');

    // Cargar datos específicos
    if (tabId === 'listar-parqueaderos') {
        cargarParqueaderosAdmin();
    } else if (tabId === 'crear-espacios') {
        cargarParqueaderosParaEspacios();
    }
}

// ============= CREAR PARQUEADERO =============
document.getElementById('formCrearParqueadero')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('nomParqueadero').value,
        ubicacion: document.getElementById('ubicacion').value,
        ciudad: document.getElementById('ciudad').value || '',
        capacidadAutos: parseInt(document.getElementById('capacidadAutos').value),
        capacidadMotos: parseInt(document.getElementById('capacidadMotos').value),
        tarifaAutoHora: parseFloat(document.getElementById('tarifaAuto').value),
        tarifaMotoHora: parseFloat(document.getElementById('tarifaMoto').value),
        descripcion: document.getElementById('descripcion').value || '',
        telefono: document.getElementById('telefonoParq').value || '',
        email: document.getElementById('emailParq').value || ''
    };

    const resultado = await hacerPOST('/parqueaderos', datos);

    if (resultado) {
        mostrarNotificacion('✅ Parqueadero creado exitosamente', 'success');
        document.getElementById('formCrearParqueadero').reset();
        
        // Recargar parqueaderos
        await cargarParqueaderos();
        await cargarParqueaderosParaEspacios();
    } else {
        mostrarNotificacion('❌ Error al crear parqueadero', 'danger');
    }
});

// ============= CREAR ESPACIOS =============
document.getElementById('formCrearEspacios')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const parqueaderoId = parseInt(document.getElementById('parqueaderoEspacios').value);
    const tipoVehiculo = document.getElementById('tipoVehiculoEspacio').value;
    const cantidad = parseInt(document.getElementById('cantidadEspacios').value);

    if (!parqueaderoId || !tipoVehiculo || !cantidad) {
        mostrarNotificacion('Por favor completa todos los campos', 'warning');
        return;
    }

    const datos = {
        parqueaderoId,
        tipoVehiculo,
        cantidad
    };

    const resultado = await hacerPOST('/espacios', datos);

    if (resultado) {
        mostrarNotificacion(`✅ ${cantidad} espacios creados exitosamente`, 'success');
        document.getElementById('formCrearEspacios').reset();
        document.getElementById('previaEspacios').classList.add('hidden');
        
        // Recargar datos
        await actualizarEstadisticas();
    } else {
        mostrarNotificacion('❌ Error al crear espacios', 'danger');
    }
});

// Actualizar info del parqueadero
async function actualizarInfoParq() {
    const parqueaderoId = document.getElementById('parqueaderoEspacios').value;
    const infoDiv = document.getElementById('infoParq');
    const gridPreviaEspacios = document.getElementById('gridPreviaEspacios');

    if (!parqueaderoId) {
        infoDiv.classList.add('hidden');
        return;
    }

    const parqueaderos = await obtenerParqueaderos();
    const parqueadero = parqueaderos.find(p => p.id == parqueaderoId);

    if (parqueadero) {
        document.getElementById('infoUbicacion').textContent = parqueadero.ubicacion;
        document.getElementById('infoTarifaAuto').textContent = `$${parqueadero.tarifa_auto_por_hora}`;
        document.getElementById('infoTarifaMoto').textContent = `$${parqueadero.tarifa_moto_por_hora}`;
        infoDiv.classList.remove('hidden');
    }

    // Mostrar previa cuando se cambia cantidad
    document.getElementById('cantidadEspacios')?.addEventListener('input', () => {
        const cantidad = parseInt(document.getElementById('cantidadEspacios').value);
        const tipo = document.getElementById('tipoVehiculoEspacio').value;

        if (cantidad && tipo) {
            gridPreviaEspacios.innerHTML = '';
            const prefijo = tipo === 'auto' ? 'A' : 'M';

            for (let i = 1; i <= Math.min(cantidad, 20); i++) {
                const div = document.createElement('div');
                div.className = 'espacio-item disponible';
                div.innerHTML = `
                    <div class="espacio-number">${prefijo}${i}</div>
                    <div class="espacio-estado">nuevo</div>
                `;
                gridPreviaEspacios.appendChild(div);
            }

            if (cantidad > 20) {
                const div = document.createElement('div');
                div.className = 'espacio-item disponible';
                div.innerHTML = `
                    <div class="espacio-number">...</div>
                    <div class="espacio-estado">+${cantidad - 20} más</div>
                `;
                gridPreviaEspacios.appendChild(div);
            }

            document.getElementById('previaEspacios').classList.remove('hidden');
        }
    });
}

// Cargar parqueaderos para crear espacios
async function cargarParqueaderosParaEspacios() {
    const parqueaderos = await obtenerParqueaderos();
    
    if (!parqueaderos) return;

    const select = document.getElementById('parqueaderoEspacios');
    select.innerHTML = '<option value="">Selecciona parqueadero...</option>';

    parqueaderos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nombre} - ${p.ubicacion}`;
        select.appendChild(option);
    });
}

// ============= LISTAR PARQUEADEROS =============
async function cargarParqueaderosAdmin() {
    const parqueaderos = await obtenerParqueaderos();

    if (!parqueaderos) return;

    const container = document.getElementById('listaParqueaderos');
    container.innerHTML = '';

    if (parqueaderos.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay parqueaderos registrados</p>';
        return;
    }

    for (const parq of parqueaderos) {
        // Obtener estadísticas del parqueadero
        const stats = await fetch(`http://localhost:3000/api/parqueaderos/${parq.id}/ocupacion`)
            .then(res => res.json())
            .catch(() => null);

        const card = document.createElement('div');
        card.className = 'parqueadero-card';
        card.innerHTML = `
            <h4><i class="fas fa-building"></i> ${parq.nombre}</h4>
            <p><strong>Ubicación:</strong> ${parq.ubicacion}</p>
            <p><strong>Ciudad:</strong> ${parq.ciudad || '-'}</p>
            <p><strong>Teléfono:</strong> ${parq.telefono || '-'}</p>
            <p><strong>Email:</strong> ${parq.email || '-'}</p>
            <p><strong>Descripción:</strong> ${parq.descripcion || '-'}</p>
            
            <div class="parqueadero-stats">
                <div class="stat-mini">
                    <div class="stat-mini-label">Autos Ocupados</div>
                    <div class="stat-mini-value">${stats?.autos?.ocupados || 0}/${stats?.autos?.total || 0}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">Motos Ocupadas</div>
                    <div class="stat-mini-value">${stats?.motos?.ocupadas || 0}/${stats?.motos?.total || 0}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">Tarifa Auto</div>
                    <div class="stat-mini-value">$${parq.tarifa_auto_por_hora}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">Tarifa Moto</div>
                    <div class="stat-mini-value">$${parq.tarifa_moto_por_hora}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

// Inicializar admin cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    // El primer tab activo por defecto
    const primerTab = document.querySelector('.tab-btn');
    if (primerTab) {
        primerTab.classList.add('active');
    }
});