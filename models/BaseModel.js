const supabase =
require("../config/supabase");

class BaseModel{

constructor(tabla){

this.tabla=
tabla;

}

async listar(){

return await supabase
.from(this.tabla)
.select("*");

}

async buscar(id){

return await supabase
.from(this.tabla)
.select("*")
.eq("id",id)
.single();

}

async crear(data){

return await supabase
.from(this.tabla)
.insert(data);

}

async actualizar(
id,
data
){

return await supabase
.from(this.tabla)
.update(data)
.eq("id",id);

}

async eliminar(
id
){

return await supabase
.from(this.tabla)
.delete()
.eq("id",id);

}

}

module.exports=
BaseModel;