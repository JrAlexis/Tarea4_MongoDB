/**
 * ============================================================================
 * CURSO: BIG DATA (202016911) - UNIVERSIDAD NACIONAL ABIERTA Y A DISTANCIA (UNAD)
 * ACTIVIDAD: Tarea 4 - Almacenamiento y Consultas de Datos en Big Data (MongoDB)
 * ESTUDIANTE: Jaiber Alexis Dagua Acosta (Grupo: 202016911_2204)
 * CASO DE USO: Gestión de Catálogo Polimórfico y Analítica de Órdenes en una
 *              Plataforma de Comercio Electrónico Omnicanal
 * BASE DE DATOS: ECommerce_RetailPulse_DB
 * ============================================================================
 */

// ============================================================================
// BLOQUE 1: CREACIÓN DE BASE DE DATOS Y POBLACIÓN DE DATOS (138 DOCUMENTOS)
// ============================================================================

use ECommerce_RetailPulse_DB;

db.clientes_vip.deleteMany({});
db.ordenes_compra.deleteMany({});

// 1.1. Inserción de 8 documentos maestros en 'clientes_vip'
db.clientes_vip.insertMany([
  { cliente_id: "CLI-101", nombre_completo: "Andrés Felipe Mora", ciudad: "Bogotá, D.C.", departamento: "Cundinamarca", nivel_membresia: "Platino", puntos_fidelidad: 4850 },
  { cliente_id: "CLI-102", nombre_completo: "Valeria Gómez Ríos", ciudad: "Medellín", departamento: "Antioquia", nivel_membresia: "Oro", puntos_fidelidad: 3120 },
  { cliente_id: "CLI-103", nombre_completo: "Julián David Castro", ciudad: "Cali", departamento: "Valle del Cauca", nivel_membresia: "Platino", puntos_fidelidad: 5200 },
  { cliente_id: "CLI-104", nombre_completo: "Camila Andrea Ortiz", ciudad: "Barranquilla", departamento: "Atlántico", nivel_membresia: "Plata", puntos_fidelidad: 1450 },
  { cliente_id: "CLI-105", nombre_completo: "Sebastián Rojas Gil", ciudad: "Bucaramanga", departamento: "Santander", nivel_membresia: "Oro", puntos_fidelidad: 2890 },
  { cliente_id: "CLI-106", nombre_completo: "Natalia Suárez Peña", ciudad: "Cúcuta", departamento: "Norte de Santander", nivel_membresia: "Platino", puntos_fidelidad: 4600 },
  { cliente_id: "CLI-107", nombre_completo: "Mateo Vargas León", ciudad: "Cartagena", departamento: "Bolívar", nivel_membresia: "Plata", puntos_fidelidad: 1180 },
  { cliente_id: "CLI-108", nombre_completo: "Daniela Pardo Cruz", ciudad: "Pereira", departamento: "Risaralda", nivel_membresia: "Oro", puntos_fidelidad: 3400 }
]);

// 1.2. Generación e inserción masiva de 130 documentos en 'ordenes_compra'
db.ordenes_compra.insertMany(Array.from({ length: 130 }, (_, idx) => {
  const n = idx + 1;
  const idsClientes = ["CLI-101", "CLI-102", "CLI-103", "CLI-104", "CLI-105", "CLI-106", "CLI-107", "CLI-108"];
  const canales = ["App Móvil", "Portal Web", "Marketplace Aliado"];
  const pagos = ["Tarjeta Crédito", "PSE", "Billetera Digital", "Transferencia"];
  const estados = ["ENTREGADO", "ENTREGADO", "EN_TRANSITO", "DEVUELTO"];
  const catalogo = [
    { cat: "Tecnología", prod: "Portátil UltraBook 14\"", precio: 3450000, specs: { procesador: "Core i7", ram_gb: 16, almacenamiento: "512GB SSD" } },
    { cat: "Calzado Deportivo", prod: "Tenis Running Carbon Pro", precio: 480000, specs: { talla_eu: 41, material: "Malla Transpirable", pisada: "Neutra" } },
    { cat: "Hogar Inteligente", prod: "Asistente Voz Hub Max", precio: 620000, specs: { conectividad: "WiFi 6 + Zigbee", pantalla_pulgadas: 10, color: "Gris Grafito" } },
    { cat: "Electrodomésticos", prod: "Cafetera Espresso Barista", precio: 1150000, specs: { presion_bares: 15, capacidad_litros: 1.8, voltaje: "110V" } }
  ];
  const item = catalogo[n % 4];
  const unidades = 1 + (n % 3);
  const descuento = (n % 5 === 0) ? 0.10 : 0;

  return {
    numero_orden: "ORD-" + (5000 + n),
    cliente_id: idsClientes[n % 8],
    categoria: item.cat,
    canal_venta: canales[n % 3],
    metodo_pago: pagos[n % 4],
    estado_orden: estados[n % 4],
    cantidad_unidades: unidades,
    descuento_aplicado_pct: descuento * 100,
    total_pagado_cop: Math.round(item.precio * unidades * (1 - descuento)),
    fecha_compra: new Date(2026, 9, 1 + (n % 28), 9 + (n % 12), 30),
    detalle_producto: {
      nombre_articulo: item.prod,
      precio_unitario_cop: item.precio,
      especificaciones_tecnicas: item.specs
    }
  };
}));

print("Clientes VIP registrados:", db.clientes_vip.countDocuments());
print("Órdenes de compra registradas:", db.ordenes_compra.countDocuments());


// ============================================================================
// BLOQUE 2: CONSULTAS BÁSICAS (CRUD: INSERCIÓN, SELECCIÓN, ACTUALIZACIÓN, ELIMINACIÓN)
// ============================================================================

// 2.1. Inserción individual (insertOne)
db.ordenes_compra.insertOne({
  numero_orden: "ORD-9999",
  cliente_id: "CLI-101",
  categoria: "Tecnología",
  canal_venta: "App Móvil",
  metodo_pago: "Tarjeta Crédito",
  estado_orden: "PROCESANDO",
  cantidad_unidades: 2,
  descuento_aplicado_pct: 5,
  total_pagado_cop: 6555000,
  fecha_compra: new Date(),
  detalle_producto: {
    nombre_articulo: "Estación Trabajo Pro",
    precio_unitario_cop: 3450000,
    especificaciones_tecnicas: { procesador: "Core i9", ram_gb: 32 }
  }
});

// 2.2. Selección con filtro, proyección y ordenamiento (find)
db.ordenes_compra.find(
  { categoria: "Tecnología", estado_orden: "ENTREGADO" },
  { _id: 0, numero_orden: 1, cliente_id: 1, canal_venta: 1, total_pagado_cop: 1 }
).sort({ total_pagado_cop: -1 }).limit(5).toArray();

// 2.3. Actualización masiva (updateMany)
db.ordenes_compra.updateMany(
  { total_pagado_cop: { $gte: 3000000 } },
  { $set: { envio_express_gratis: true } }
);

// 2.4. Eliminación individual (deleteOne)
db.ordenes_compra.deleteOne(
  { numero_orden: "ORD-9999" }
);


// ============================================================================
// BLOQUE 3: CONSULTAS CON FILTROS AVANZADOS Y JOIN ENTRE COLECCIONES ($lookup)
// ============================================================================

// 3.1. Filtros con operadores lógicos y de comparación ($and, $in, $gt, $lte)
db.ordenes_compra.find(
  {
    $and: [
      { canal_venta: { $in: ["App Móvil", "Portal Web"] } },
      { metodo_pago: { $in: ["PSE", "Tarjeta Crédito"] } },
      { total_pagado_cop: { $gt: 1000000, $lte: 7000000 } }
    ]
  },
  { _id: 0, numero_orden: 1, cliente_id: 1, categoria: 1, metodo_pago: 1, total_pagado_cop: 1 }
).limit(5).toArray();

// 3.2. Join entre colecciones ($lookup + $unwind + $project)
db.ordenes_compra.aggregate([
  { $match: { estado_orden: "DEVUELTO" } },
  {
    $lookup: {
      from: "clientes_vip",
      localField: "cliente_id",
      foreignField: "cliente_id",
      as: "datos_cliente"
    }
  },
  { $unwind: "$datos_cliente" },
  {
    $project: {
      _id: 0,
      numero_orden: 1,
      cliente: "$datos_cliente.nombre_completo",
      ciudad: "$datos_cliente.ciudad",
      membresia: "$datos_cliente.nivel_membresia",
      categoria: 1,
      total_pagado_cop: 1
    }
  },
  { $limit: 5 }
]).toArray();


// ============================================================================
// BLOQUE 4: CONSULTAS DE AGREGACIÓN ESTADÍSTICA ($group, $sum, $avg, $min, $max)
// ============================================================================

// 4.1. Agregación 1: Ingresos totales, unidades vendidas y ticket promedio por categoría
db.ordenes_compra.aggregate([
  {
    $group: {
      _id: "$categoria",
      total_ordenes: { $sum: 1 },
      unidades_vendidas: { $sum: "$cantidad_unidades" },
      ingresos_totales_cop: { $sum: "$total_pagado_cop" },
      ticket_promedio_cop: { $avg: "$total_pagado_cop" }
    }
  },
  {
    $project: {
      _id: 0,
      categoria: "$_id",
      total_ordenes: 1,
      unidades_vendidas: 1,
      ingresos_totales_cop: 1,
      ticket_promedio_cop: { $round: ["$ticket_promedio_cop", 0] }
    }
  },
  { $sort: { ingresos_totales_cop: -1 } }
]).toArray();

// 4.2. Agregación 2: Estadísticas comerciales por canal de venta
db.ordenes_compra.aggregate([
  {
    $group: {
      _id: "$canal_venta",
      cantidad_pedidos: { $sum: 1 },
      venta_minima_cop: { $min: "$total_pagado_cop" },
      venta_maxima_cop: { $max: "$total_pagado_cop" },
      promedio_venta_cop: { $avg: "$total_pagado_cop" }
    }
  },
  {
    $project: {
      _id: 0,
      canal_venta: "$_id",
      cantidad_pedidos: 1,
      venta_minima_cop: 1,
      venta_maxima_cop: 1,
      promedio_venta_cop: { $round: ["$promedio_venta_cop", 0] }
    }
  },
  { $sort: { cantidad_pedidos: -1 } }
]).toArray();
