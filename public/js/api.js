/* ============================================
   JAVASCRIPT - API.JS
   ============================================ */

// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Funciones de la API

class PosAPI {
    // ========== USUARIOS ==========
    
    static async login(email, contraseña) {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contraseña })
        });
        return response.json();
    }

    static async registro(nombre, email, contraseña) {
        const response = await fetch(`${API_URL}/usuarios/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, contraseña })
        });
        return response.json();
    }

    static async getPerfil() {
        const response = await fetch(`${API_URL}/usuarios/me`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    // ========== CATEGORÍAS ==========

    static async getCategorias() {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async createCategoria(nombre, descripcion) {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ nombre, descripcion })
        });
        return response.json();
    }

    // ========== PRODUCTOS ==========

    static async getProductos(filtros = {}) {
        let url = `${API_URL}/productos`;
        const params = new URLSearchParams();
        
        if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
        if (filtros.buscar) params.append('buscar', filtros.buscar);
        if (filtros.estado !== undefined) params.append('estado', filtros.estado);
        
        if (params.toString()) url += '?' + params.toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getProductoPorId(id) {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async createProducto(producto) {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(producto)
        });
        return response.json();
    }

    static async updateProducto(id, producto) {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(producto)
        });
        return response.json();
    }

    static async deleteProducto(id) {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getProductosBajoStock() {
        const response = await fetch(`${API_URL}/productos/bajo-stock`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    // ========== CLIENTES ==========

    static async getClientes() {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getClientePorId(id) {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async createCliente(cliente) {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(cliente)
        });
        return response.json();
    }

    static async updateCliente(id, cliente) {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(cliente)
        });
        return response.json();
    }

    // ========== FACTURAS ==========

    static async getFacturas(filtros = {}) {
        let url = `${API_URL}/facturas`;
        const params = new URLSearchParams();
        
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
        
        if (params.toString()) url += '?' + params.toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getFacturaPorId(id) {
        const response = await fetch(`${API_URL}/facturas/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async createFactura(factura) {
        const response = await fetch(`${API_URL}/facturas`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(factura)
        });
        return response.json();
    }

    static async getUltimasFacturas(limite = 5) {
        const response = await fetch(`${API_URL}/facturas?limit=${limite}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    // ========== INVENTARIO ==========

    static async getMovimientosInventario(producto_id) {
        const response = await fetch(`${API_URL}/inventario/movimientos/${producto_id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async crearMovimientoInventario(movimiento) {
        const response = await fetch(`${API_URL}/inventario/movimientos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(movimiento)
        });
        return response.json();
    }

    // ========== REPORTES ==========

    static async getReporteVentas(fechaInicio, fechaFin) {
        const response = await fetch(`${API_URL}/reportes/ventas?desde=${fechaInicio}&hasta=${fechaFin}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getReporteProductos() {
        const response = await fetch(`${API_URL}/reportes/productos`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }

    static async getReporteClientes() {
        const response = await fetch(`${API_URL}/reportes/clientes`, {
            method: 'GET',
            headers: getHeaders()
        });
        return response.json();
    }
}

// Utilidades

class Util {
    static formatMoney(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 4000);
    }

    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
}
