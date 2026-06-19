async function cargar(){

const r=
await fetch(

API+

"/clientes"

);

const datos=
await r.json();

let html="";

datos.forEach(c=>{

html+=`

<tr>

<td>

${c.nombre}

</td>

<td>

${c.direccion}

</td>

</tr>

`;

});

tabla.innerHTML=
html;

}

async function crear(){

await fetch(

API+

"/clientes",

{

method:
"POST",

headers:{

"Content-Type":

"application/json"

},

body:

JSON.stringify({

nombre:

nombre.value,

direccion:

direccion.value

})

}

);

cargar();

}

cargar();