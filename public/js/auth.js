/* ============================================
   AUTH.JS - Autenticación
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await PosAPI.login(email, password);
                
                if (result.error) {
                    showError('loginForm', result.error);
                } else {
                    // Guardar token
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('usuario', JSON.stringify(result.usuario));
                    
                    // Redirigir
                    window.location.href = '/dashboard.html';
                }
            } catch (error) {
                showError('loginForm', 'Error al conectar con el servidor');
            }
        });
    }

    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('passwordConfirm').value;

            if (password !== passwordConfirm) {
                showError('registroForm', 'Las contraseñas no coinciden');
                return;
            }

            try {
                const result = await PosAPI.registro(nombre, email, password);
                
                if (result.error) {
                    showError('registroForm', result.error);
                } else {
                    // Guardar token
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('usuario', JSON.stringify(result.usuario));
                    
                    // Mostrar éxito
                    document.getElementById('successMessage').style.display = 'flex';
                    document.getElementById('successMessage').textContent = 'Cuenta creada exitosamente. Redirigiendo...';
                    
                    // Redirigir después de 2 segundos
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 2000);
                }
            } catch (error) {
                showError('registroForm', 'Error al crear la cuenta');
            }
        });
    }

    // Verificar si está logueado
    verificarAutenticacion();
});

function showError(formId, message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'flex';
        errorDiv.textContent = message;
    }
}

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    if (!token && (currentPage.includes('dashboard') || currentPage.includes('facturas'))) {
        window.location.href = '/login.html';
    }

    if (token && (currentPage.includes('login') || currentPage.includes('registro'))) {
        window.location.href = '/dashboard.html';
    }
}
