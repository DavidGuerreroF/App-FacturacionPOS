const express = require("express");
const cors = require("cors");

require("dotenv").config();

const iniciar =
require("./database/initDatabase");

const clientes =
require("./routes/clientes");

const inventario =
require("./routes/inventario");

const facturas =
require("./routes/facturas");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use("/clientes", clientes);

app.use("/inventario", inventario);

app.use("/facturas", facturas);

(async () => {

    await iniciar();

    app.listen(
        process.env.PORT,
        () => {

            console.log(
                `Servidor iniciado en puerto ${process.env.PORT}`
            );

        }
    );

})();