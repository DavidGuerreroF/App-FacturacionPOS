const Cliente =
require("../models/Cliente");

exports.listar =
async(req,res)=>{

const {data,error}
=
await Cliente.listar();

if(error){

return res
.status(500)
.json(error);

}

res.json(data);

};

exports.buscar =
async(req,res)=>{

const {data,error}
=
await Cliente.buscar(
req.params.id
);

if(error){

return res
.status(404)
.json(error);

}

res.json(data);

};

exports.crear =
async(req,res)=>{

const {data,error}
=
await Cliente.crear(
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

const {data,error}
=
await Cliente.actualizar(
req.params.id,
req.body
);

res.json(data);

};

exports.eliminar =
async(req,res)=>{

await Cliente.eliminar(
req.params.id
);

res.json({
mensaje:
"Cliente eliminado"
});

};