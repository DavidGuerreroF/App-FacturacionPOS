require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const initDatabase = require("./database/initDatabase");

// Routes
const usuariosRoutes = require("./routes/usuarios");
const categoriasRoutes = require("./routes/categorias");
const productosRoutes = require("./routes/productos");
const clientesRoutes = require("./routes/clientes");
const facturasRoutes = require("./routes/facturas");
const inventarioRoutes = require("./routes/inventario");
const reportesRoutes = require("./routes/reportes");

// Middleware
const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/errorHandler");
const auditMiddleware = require("./middlewares/auditoria");

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(auditMiddleware);

// Rutas públicas (sin autenticación)
app.use("/api/usuarios/login", usuariosRoutes);
app.use("/api/usuarios/registro", usuariosRoutes);

// Rutas protegidas (requieren autenticación)
app.use("/api/usuarios", authMiddleware, usuariosRoutes);
app.use("/api/categorias", authMiddleware, categoriasRoutes);
app.use("/api/productos", authMiddleware, productosRoutes);
app.use("/api/clientes", authMiddleware, clientesRoutes);
app.use("/api/facturas", authMiddleware, facturasRoutes);
app.use("/api/inventario", authMiddleware, inventarioRoutes);
app.use("/api/reportes", authMiddleware, reportesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Iniciar servidor
(async () => {
  try {
    await initDatabase();
    
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Servidor iniciado en puerto ${process.env.PORT || 3000}`);
      console.log(`🔗 POS Facturación - ${process.env.STORE_NAME || 'Mi Almacén'}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
})();

module.exports = app;
