const supabase = require("../config/supabase");

async function probarConexion() {

    try {

        const { error } =
            await supabase
            .from("clientes")
            .select("*")
            .limit(1);

        if (error) {

            console.log(
                "Conectado a Supabase"
            );

            return true;

        }

        console.log(
            "Conectado correctamente"
        );

        return true;

    }

    catch (e) {

        console.log(
            "Error conexión:",
            e.message
        );

        return false;

    }

}

module.exports = probarConexion;