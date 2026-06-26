document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // NAVEGACIÓN ENTRE SECCIONES
    // =========================
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");
    const pageTitle = document.getElementById("pageTitle");

    navLinks.forEach(link => {

        link.addEventListener("click", (e) => {
            e.preventDefault();

            const sectionName = link.dataset.section;

            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            sections.forEach(section => {
                section.classList.remove("active");
            });

            const targetSection = document.getElementById(
                `${sectionName}Section`
            );

            if (targetSection) {
                targetSection.classList.add("active");
            }

            pageTitle.textContent =
                link.querySelector("span").textContent;
        });

    });

    // =========================
    // MENU RESPONSIVE
    // =========================
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle) {

        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });

    }

    // =========================
    // MODAL PRODUCTOS
    // =========================
    const productoModal = document.getElementById("productoModal");
    const nuevoProductoBtn = document.getElementById("nuevoProductoBtn");
    const cancelProductoBtn = document.getElementById("cancelProductoBtn");

    if (nuevoProductoBtn) {

        nuevoProductoBtn.addEventListener("click", () => {
            productoModal.style.display = "flex";
        });

    }

    if (cancelProductoBtn) {

        cancelProductoBtn.addEventListener("click", () => {
            productoModal.style.display = "none";
        });

    }

    // =========================
    // MODAL CLIENTES
    // =========================
    const clienteModal = document.getElementById("clienteModal");
    const nuevoClienteBtn = document.getElementById("nuevoClienteBtn");
    const cancelClienteBtn = document.getElementById("cancelClienteBtn");

    if (nuevoClienteBtn) {

        nuevoClienteBtn.addEventListener("click", () => {
            clienteModal.style.display = "flex";
        });

    }

    if (cancelClienteBtn) {

        cancelClienteBtn.addEventListener("click", () => {
            clienteModal.style.display = "none";
        });

    }

    // =========================
    // BOTONES X DE LOS MODALES
    // =========================
    document.querySelectorAll(".modal-close")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                btn.closest(".modal").style.display = "none";

            });

        });

    // =========================
    // CERRAR MODAL FUERA
    // =========================
    window.addEventListener("click", (e) => {

        if (e.target.classList.contains("modal")) {

            e.target.style.display = "none";

        }

    });

    // =========================
    // CERRAR SESIÓN
    // =========================
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "/";

        });

    }

    // =========================
    // CARRITO
    // =========================
    let carrito = [];

    const carritoItems =
        document.getElementById("carritoItems");

    const subtotal =
        document.getElementById("subtotal");

    const impuesto =
        document.getElementById("impuesto");

    const total =
        document.getElementById("total");

    function actualizarTotales() {

        let sub = 0;

        carrito.forEach(item => {

            sub += item.precio * item.cantidad;

        });

        let iva = sub * 0.19;

        subtotal.textContent =
            `$${sub.toFixed(2)}`;

        impuesto.textContent =
            `$${iva.toFixed(2)}`;

        total.textContent =
            `$${(sub + iva).toFixed(2)}`;

    }

    const limpiarCarritoBtn =
        document.getElementById("limpiarCarritoBtn");

    if (limpiarCarritoBtn) {

        limpiarCarritoBtn.addEventListener("click", () => {

            carrito = [];

            carritoItems.innerHTML = "";

            actualizarTotales();

        });

    }

    // =========================
    // GENERAR FACTURA
    // =========================
    const generarFacturaBtn =
        document.getElementById("generarFacturaBtn");

    if (generarFacturaBtn) {

        generarFacturaBtn.addEventListener("click", () => {

            if (carrito.length === 0) {

                alert("Debe agregar productos");

                return;
            }

            alert("Factura generada correctamente");

        });

    }

    // =========================
    // DATOS USUARIO
    // =========================
    const usuario =
        JSON.parse(localStorage.getItem("usuario"));

    if (usuario) {

        const userName =
            document.getElementById("userName");

        const userRole =
            document.getElementById("userRole");

        if (userName)
            userName.textContent =
                usuario.nombre || "Usuario";

        if (userRole)
            userRole.textContent =
                usuario.rol || "Empleado";

    }

});
const guardarClienteBtn = document.getElementById("guardarClienteBtn");

guardarClienteBtn.addEventListener("click", async () => {

    const cliente = {
        nombre: document.getElementById("clienteNombre").value,
        documento: document.getElementById("clienteDocumento").value,
        email: document.getElementById("clienteEmail").value,
        telefono: document.getElementById("clienteTelefono").value,
        direccion: document.getElementById("clienteDireccion").value,
        ciudad: document.getElementById("clienteCiudad").value,
        tipo_cliente: document.getElementById("clienteTipo").value
    };

    try {

        const respuesta = await PosAPI.createCliente(cliente);

        console.log(respuesta);

        if (respuesta.error) {
            alert(respuesta.error);
            return;
        }

        alert("Cliente creado correctamente");

    } catch (error) {

        console.error(error);
        alert("Error al crear cliente");

    }

});