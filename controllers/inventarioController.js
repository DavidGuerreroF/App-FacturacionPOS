const Inventario =
require("../models/Inventario");

exports.listar =
async(req,res)=>{

const {data}
=
await Inventario
.listar();

res.json(data);

};

exports.crear =
async(req,res)=>{

const {data,error}
=
await Inventario
.crear(
req.body
);

if(error){

return res
.status(500)
.json(error);

}

res.json(data);

};

exports.actualizar =
async(req,res)=>{

const {data}
=
await Inventario
.actualizar(
req.params.id,
req.body
);

res.json(data);

};

exports.eliminar =
async(req,res)=>{

await Inventario
.eliminar(
req.params.id
);

res.json({
ok:true
});

};