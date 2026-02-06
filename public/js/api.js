// ============= CONFIGURACIÓN API =============
const API_URL = 'http://localhost:3000/api';

// Obtener token del localStorage
function obtenerToken() {
    return localStorage.getItem('token');
}

// GET general
async function hacerGET(endpoint) {
    try {
        console.log('🔵 GET:', `${API_URL}${endpoint}`);
        const token = obtenerToken();

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            console.log('❌ Token expirado. Redirigiendo a login...');
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error en GET:', error);
        return null;
    }
}

// POST general
async function hacerPOST(endpoint, datos) {
    try {
        console.log('🔵 POST:', `${API_URL}${endpoint}`);
        const token = obtenerToken();

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || response.statusText);
        }

        return data;
    } catch (error) {
        console.error('❌ Error en POST:', error);
        mostrarNotificacion(error.message, 'danger');
        return null;
    }
}

// PUT general
async function hacerPUT(endpoint, datos) {
    try {
        console.log('🔵 PUT:', `${API_URL}${endpoint}`);
        const token = obtenerToken();

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error en PUT:', error);
        return null;
    }
}

// ... resto de funciones igual ...

// ============= FUNCIONES ESPECÍFICAS PARQUEADERO =============

// Obtener parqueaderos
async function obtenerParqueaderos() {
    return await hacerGET('/parqueaderos');
}

// Registrar ingreso
async function registrarIngreso(datos) {
    return await hacerPOST('/ingresos', datos);
}

// Buscar ingreso activo por placa
async function buscarIngresoActivo(placa) {
    return await hacerGET(`/ingresos/activo/${placa}`);
}

// Registrar salida - RENOMBRADA A registrarSalidaAPI para evitar conflicto
async function registrarSalidaAPI(ingresoId, datos) {
    return await hacerPOST(`/salidas/${ingresoId}`, datos);
}

// Obtener alertas
async function obtenerAlertas() {
    return await hacerGET('/alertas');
}

// Obtener movimientos recientes
async function obtenerMovimientos() {
    return await hacerGET('/reportes/movimientos-recientes');
}

// Obtener estadísticas del día
async function obtenerEstadisticasDia() {
    return await hacerGET('/reportes/estadisticas-dia');
}