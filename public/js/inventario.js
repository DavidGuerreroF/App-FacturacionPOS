async function cargar(){

const r=

await fetch(

API+

"/inventario"

);

const datos=
await r.json();

let html="";

datos.forEach(p=>{

html+=`

<tr>

<td>

${p.nombre}

</td>

<td>

${p.stock}

</td>

<td>

${p.precio_venta}

</td>

</tr>

`;

});

productos.innerHTML=
html;

}

async function guardar(){

await fetch(

API+

"/inventario",

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

precio_venta:

precio.value,

stock:

stock.value

})

}

);

cargar();

}

cargar();