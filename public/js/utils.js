// ============= UTILIDADES GENERALES =============

// Mostrar/Ocultar secciones
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
        seccion.classList.remove('activa');
    });

    // Mostrar sección seleccionada
    const seccionSeleccionada = document.getElementById(seccionId);
    if (seccionSeleccionada) {
        seccionSeleccionada.classList.add('activa');
        window.scrollTo(0, 0);
    }

    // Actualizar nav activo
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
}

// Formatear moneda
function formatearMoneda(cantidad) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(cantidad);
}

// Formatear fecha y hora
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatear solo hora
function formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Calcular diferencia de tiempo en minutos
function calcularMinutos(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return Math.floor((fin - inicio) / (1000 * 60));
}

// Calcular horas desde minutos
function calcularHoras(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
}

// Convertir placa a mayúsculas
function normalizarPlaca(placa) {
    return placa.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

// Mostrar modal
function mostrarModal(titulo, contenido, botones = []) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    let html = `<h3>${titulo}</h3>`;
    html += `<p>${contenido}</p>`;

    if (botones.length > 0) {
        html += '<div style="display: flex; gap: 1rem; margin-top: 1.5rem;">';
        botones.forEach(boton => {
            html += `<button class="btn ${boton.clase}" onclick="${boton.funcion}">${boton.texto}</button>`;
        });
        html += '</div>';
    }

    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    const notif = document.createElement('div');
    notif.className = `alert alert-${tipo}`;
    notif.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${mensaje}</span>
    `;
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.right = '20px';
    notif.style.zIndex = '3000';
    notif.style.maxWidth = '400px';
    notif.style.animation = 'slideInRight 0.3s ease';

    document.body.appendChild(notif);

    if (duracion > 0) {
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, duracion);
    }
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

// Toggle hamburger menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Cerrar menu al hacer click en un link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
});

// Animación CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);