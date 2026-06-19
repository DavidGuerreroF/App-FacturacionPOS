CREATE TABLE IF NOT EXISTS clientes(

id BIGSERIAL PRIMARY KEY,

nombre VARCHAR(150) NOT NULL,

documento VARCHAR(50),

direccion TEXT,

telefono VARCHAR(30),

correo VARCHAR(150),

created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS vendedores(

id BIGSERIAL PRIMARY KEY,

nombre VARCHAR(150),

comision NUMERIC(5,2),

activo BOOLEAN DEFAULT TRUE

);

CREATE TABLE IF NOT EXISTS impuestos(

id BIGSERIAL PRIMARY KEY,

nombre VARCHAR(50),

porcentaje NUMERIC(5,2)

);

CREATE TABLE IF NOT EXISTS retenciones(

id BIGSERIAL PRIMARY KEY,

nombre VARCHAR(50),

porcentaje NUMERIC(5,2)

);

CREATE TABLE IF NOT EXISTS inventario(

id BIGSERIAL PRIMARY KEY,

codigo VARCHAR(100) UNIQUE,

nombre VARCHAR(150),

descripcion TEXT,

stock INTEGER DEFAULT 0,

precio_compra NUMERIC(12,2),

precio_venta NUMERIC(12,2),

descuento NUMERIC(10,2) DEFAULT 0,

impuesto_id BIGINT,

created_at TIMESTAMP DEFAULT NOW(),

CONSTRAINT fk_impuesto
FOREIGN KEY(impuesto_id)

REFERENCES impuestos(id)

);

CREATE TABLE IF NOT EXISTS facturas(

id BIGSERIAL PRIMARY KEY,

numero_factura VARCHAR(50) UNIQUE,

cliente_id BIGINT,

vendedor_id BIGINT,

fecha TIMESTAMP DEFAULT NOW(),

subtotal NUMERIC(12,2),

descuento_total NUMERIC(12,2),

impuesto_total NUMERIC(12,2),

retencion_total NUMERIC(12,2),

total NUMERIC(12,2),

estado VARCHAR(20)
DEFAULT 'ACTIVA',

CONSTRAINT fk_cliente
FOREIGN KEY(cliente_id)

REFERENCES clientes(id),

CONSTRAINT fk_vendedor
FOREIGN KEY(vendedor_id)

REFERENCES vendedores(id)

);

CREATE TABLE IF NOT EXISTS detalle_factura(

id BIGSERIAL PRIMARY KEY,

factura_id BIGINT,

inventario_id BIGINT,

cantidad INTEGER,

precio_unitario NUMERIC(12,2),

descuento NUMERIC(12,2),

impuesto NUMERIC(12,2),

subtotal NUMERIC(12,2),

CONSTRAINT fk_factura
FOREIGN KEY(factura_id)

REFERENCES facturas(id)

ON DELETE CASCADE,

CONSTRAINT fk_producto

FOREIGN KEY(inventario_id)

REFERENCES inventario(id)

);

