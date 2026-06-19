let items=[];

function render(){

let html="";

items.forEach(i=>{

html+=`

<tr>

<td>

${i.id}

</td>

<td>

${i.cantidad}

</td>

</tr>

`;

});

carrito.innerHTML=
html;

}

function agregar(){

items.push({

id:

Number(
producto.value
),

cantidad:

Number(
cantidad.value
)

});

render();

}

async function facturar(){

await fetch(

API+

"/facturas",

{

method:
"POST",

headers:{

"Content-Type":

"application/json"

},

body:

JSON.stringify({

cliente_id:1,

vendedor_id:1,

items

})

}

);

alert(
"Factura creada"
);

items=[];

render();

}