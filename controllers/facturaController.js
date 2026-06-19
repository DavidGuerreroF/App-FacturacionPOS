const Factura =
require("../models/Factura");

const Inventario =
require("../models/Inventario");

const supabase =
require("../config/supabase");

exports.crear =
async(req,res)=>{

try{

const {

cliente_id,
vendedor_id,
items

}
=
req.body;

let subtotal=0;

for(
const item
of items
){

const {
data:producto
}
=
await Inventario
.buscar(
item.id
);

if(
producto.stock
<
item.cantidad
){

return res
.status(400)
.json({

error:
"Stock insuficiente"

});

}

subtotal+=

producto
.precio_venta

*

item.cantidad;

}

const total=
subtotal;

const numero=

"FAC-"

+

Date.now();

const {
data:
factura
}
=
await Factura
.crear({

numero_factura:
numero,

cliente_id,

vendedor_id,

subtotal,

descuento_total:0,

impuesto_total:0,

retencion_total:0,

total

});

for(
const item
of items
){

const {
data:
producto
}
=
await Inventario
.buscar(
item.id
);

await Inventario
.actualizar(

item.id,

{

stock:

producto.stock

-

item.cantidad

}

);

await supabase

.from(
"detalle_factura"
)

.insert({

factura_id:
factura[0].id,

inventario_id:
item.id,

cantidad:
item.cantidad,

precio_unitario:
producto.precio_venta,

subtotal:
producto
.precio_venta
*
item.cantidad

});

}

res.json({

ok:true,

factura

});

}

catch(e){

res
.status(500)
.json({

error:
e.message

});

}

};