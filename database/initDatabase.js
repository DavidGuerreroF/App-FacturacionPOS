const probarConexion =
require("./connection");

async function iniciar() {

const ok =
await probarConexion();

if(!ok){

throw new Error(
"No conecta BD"
);

}

console.log(
"Base lista"
);

}

module.exports =
iniciar;